import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { IncomeModel } from "@/models/Income";
import { PurchaseModel } from "@/models/Purchase";
import { RuleModel } from "@/models/Rule";
import { ServiceModel } from "@/models/Service";
import { UserModel } from "@/models/User";

export type PurchaseResult = {
  purchaseId: string;
  bv: number;
  incomesCreated: number;
};

function computeLevelAmount(level1Amount: number, level: number) {
  // Each next level gets half of the previous level’s income.
  return level1Amount / Math.pow(2, level - 1);
}

async function distributeIncome({
  buyerId,
  purchaseId,
  bv,
  session,
}: {
  buyerId: mongoose.Types.ObjectId;
  purchaseId: mongoose.Types.ObjectId;
  bv: number;
  session?: mongoose.ClientSession;
}) {
  const activeRule = await RuleModel.findOne({ isActive: true }).session(session ?? null);
  if (!activeRule) {
    throw new Error("No active rule configured");
  }

  const level1Amount = bv * activeRule.basePayoutPerBV;

  // Walk up the referral chain.
  let currentUser = await UserModel.findById(buyerId).session(session ?? null);
  if (!currentUser) throw new Error("Buyer not found");

  let incomesCreated = 0;
  let level = 1;

  while (level <= activeRule.maxLevels && currentUser.parent) {
    const parent = await UserModel.findById(currentUser.parent).session(session ?? null);
    if (!parent) break;

    const amount = computeLevelAmount(level1Amount, level);
    if (amount <= 0) break;

    await IncomeModel.create(
      [
        {
          fromUser: buyerId,
          toUser: parent._id,
          purchase: purchaseId,
          level,
          bv,
          amount,
        },
      ],
      session ? { session } : undefined
    );

    incomesCreated++;
    currentUser = parent;
    level++;
  }

  return incomesCreated;
}

export async function createPurchaseAndDistributeIncome({
  buyerId,
  serviceId,
}: {
  buyerId: string;
  serviceId: string;
}): Promise<PurchaseResult> {
  await connectToDatabase();

  const buyerObjectId = new mongoose.Types.ObjectId(buyerId);
  const service = await ServiceModel.findById(serviceId);
  const legacyService = service as unknown as { isActive?: boolean; bv?: number } | null;
  const status = service?.status ?? (legacyService?.isActive ? "active" : "inactive");
  if (!service || status !== "active") {
    throw new Error("Service not found or inactive");
  }

  const bv = (service.businessVolume ?? legacyService?.bv) as number;
  if (!Number.isFinite(bv) || bv < 0) {
    throw new Error("Service has invalid BV");
  }

  // Prefer a transaction when available (replica set). If unsupported, fall back.
  const session = await mongoose.startSession();
  try {
    let result: PurchaseResult | null = null;

    await session.withTransaction(async () => {
      const [purchase] = await PurchaseModel.create(
        [{ user: buyerObjectId, service: service._id, bv }],
        { session }
      );

      const incomesCreated = await distributeIncome({
        buyerId: buyerObjectId,
        purchaseId: purchase._id,
        bv,
        session,
      });

      result = {
        purchaseId: purchase._id.toString(),
        bv,
        incomesCreated,
      };
    });

    if (!result) throw new Error("Transaction failed");
    return result;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    // Common local-dev MongoDB setup doesn't support transactions.
    if (message.includes("Transaction numbers are only allowed") || message.includes("replica set")) {
      const purchase = await PurchaseModel.create({ user: buyerObjectId, service: service._id, bv });
      const incomesCreated = await distributeIncome({
        buyerId: buyerObjectId,
        purchaseId: purchase._id,
        bv,
      });

      return {
        purchaseId: purchase._id.toString(),
        bv,
        incomesCreated,
      };
    }

    throw err;
  } finally {
    session.endSession();
  }
}
