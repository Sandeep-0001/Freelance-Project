import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { DistributionRuleModel } from "@/models/DistributionRule";
import { IncomeLogModel } from "@/models/IncomeLog";
import { IncomeModel } from "@/models/Income";
import { ServiceModel } from "@/models/Service";
import { UserModel } from "@/models/User";

export type DistributeBVResult = {
  bv: number;
  logsCreated: number;
  levelsPaid: number;
};

function asObjectId(id: string, label: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${label}`);
  }
  return new mongoose.Types.ObjectId(id);
}

type ActiveDistributionRule = {
  basePercentage: number;
  decayEnabled: boolean;
};

async function getActiveDistributionRule(session: mongoose.ClientSession): Promise<ActiveDistributionRule> {
  const rule = await DistributionRuleModel.findOne({ isActive: true })
    .sort({ createdAt: -1 })
    .select("basePercentage decayEnabled")
    .session(session);

  // Default behavior when no rule is configured:
  // Level 1 = 5% of BV, each next level = 50% of previous.
  if (!rule) return { basePercentage: 0.05, decayEnabled: true };

  const basePercentage = Number(rule.basePercentage);
  if (!Number.isFinite(basePercentage) || basePercentage < 0 || basePercentage > 1) {
    throw new Error("Invalid distribution rule: basePercentage");
  }

  return { basePercentage, decayEnabled: Boolean(rule.decayEnabled) };
}

async function distributeBusinessVolumeInSession(options: {
  userObjectId: mongoose.Types.ObjectId;
  serviceObjectId: mongoose.Types.ObjectId;
  purchaseObjectId?: mongoose.Types.ObjectId;
  session: mongoose.ClientSession;
}): Promise<DistributeBVResult> {
  const { userObjectId, serviceObjectId, purchaseObjectId, session } = options;

  const rule = await getActiveDistributionRule(session);

  const service = await ServiceModel.findById(serviceObjectId)
    .select("businessVolume status bv isActive")
    .session(session);

  if (!service) throw new Error("Service not found");

  const legacyService = service as unknown as { isActive?: boolean; bv?: number };
  const status = service.status ?? (legacyService.isActive ? "active" : "inactive");
  if (status !== "active") throw new Error("Service is inactive");

  const bv = (service.businessVolume ?? legacyService.bv) as number;
  if (!Number.isFinite(bv) || bv < 0) throw new Error("Service has invalid BV");

  const buyer = await UserModel.findById(userObjectId).select("parent").session(session);
  if (!buyer) throw new Error("User not found");

  let parentId = buyer.parent ? new mongoose.Types.ObjectId(buyer.parent) : null;
  let level = 1;
  let incomeAmount = bv * rule.basePercentage;

  const visited = new Set<string>([userObjectId.toString()]);
  const logs: Array<{
    fromUserId: mongoose.Types.ObjectId;
    toUserId: mongoose.Types.ObjectId;
    level: number;
    bv: number;
    incomeAmount: number;
  }> = [];

  const incomes: Array<{
    fromUser: mongoose.Types.ObjectId;
    toUser: mongoose.Types.ObjectId;
    purchase: mongoose.Types.ObjectId;
    level: number;
    bv: number;
    amount: number;
  }> = [];

  // Guardrail for corrupt graphs (should be impossible with correct parent assignment).
  const MAX_LEVELS = 50_000;

  while (parentId) {
    const parentKey = parentId.toString();
    if (visited.has(parentKey)) {
      throw new Error("Circular reference detected in referral chain");
    }
    visited.add(parentKey);

    logs.push({
      fromUserId: userObjectId,
      toUserId: parentId,
      level,
      bv,
      incomeAmount,
    });

    if (purchaseObjectId) {
      incomes.push({
        fromUser: userObjectId,
        toUser: parentId,
        purchase: purchaseObjectId,
        level,
        bv,
        amount: incomeAmount,
      });
    }

    if (level >= MAX_LEVELS) {
      throw new Error("Referral chain too deep or corrupt");
    }

    const parent = await UserModel.findById(parentId).select("parent").session(session);
    parentId = parent?.parent ? new mongoose.Types.ObjectId(parent.parent) : null;

    level += 1;
    if (!rule.decayEnabled) {
      break;
    }

    incomeAmount /= 2;
  }

  if (logs.length > 0) {
    await IncomeLogModel.insertMany(logs, { session });
  }

  if (purchaseObjectId && incomes.length > 0) {
    await IncomeModel.insertMany(incomes, { session });
  }

  return {
    bv,
    logsCreated: logs.length,
    levelsPaid: logs.length,
  };
}

/**
 * Distribute Business Volume (BV) income up the referral chain.
 *
 * Rules:
 * - Input: userId, serviceId
 * - Fetch service BV
 * - Traverse referral parents upward
 * - Level 1 gets 5% of BV
 * - Each next level gets half of previous
 * - Stop when parent is null
 * - Store income logs in MongoDB
 * - Use MongoDB transaction to ensure consistency
 */
export async function distributeBusinessVolume(options: {
  userId: string;
  serviceId: string;
}): Promise<DistributeBVResult> {
  await connectToDatabase();

  const userObjectId = asObjectId(options.userId, "userId");
  const serviceObjectId = asObjectId(options.serviceId, "serviceId");

  const session = await mongoose.startSession();

  try {
    let result: DistributeBVResult | null = null;

    await session.withTransaction(async () => {
      result = await distributeBusinessVolumeInSession({
        userObjectId,
        serviceObjectId,
        session,
      });
    });

    if (!result) throw new Error("Transaction failed");
    return result;
  } finally {
    session.endSession();
  }
}

/**
 * Same distribution logic, but meant to be called inside another transaction.
 * Useful for "purchase + income logs" in a single atomic operation.
 */
export async function distributeBusinessVolumeWithSession(options: {
  userId: string;
  serviceId: string;
  purchaseId?: string;
  session: mongoose.ClientSession;
}): Promise<DistributeBVResult> {
  const userObjectId = asObjectId(options.userId, "userId");
  const serviceObjectId = asObjectId(options.serviceId, "serviceId");
  const purchaseObjectId = options.purchaseId
    ? asObjectId(options.purchaseId, "purchaseId")
    : undefined;

  return distributeBusinessVolumeInSession({
    userObjectId,
    serviceObjectId,
    purchaseObjectId,
    session: options.session,
  });
}
