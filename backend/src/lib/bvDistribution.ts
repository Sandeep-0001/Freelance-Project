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
  const transactionId = purchaseObjectId?.toString() || `tx-${Date.now()}`;

  console.log(`[BV Distribution ${transactionId}] Starting distribution for user ${userObjectId} purchasing service ${serviceObjectId}`);

  const rule = await getActiveDistributionRule(session);
  console.log(`[BV Distribution ${transactionId}] Using rule: basePercentage=${rule.basePercentage * 100}%, decayEnabled=${rule.decayEnabled}`);

  const service = await ServiceModel.findById(serviceObjectId)
    .select("businessVolume status bv isActive")
    .session(session);

  if (!service) {
    console.error(`[BV Distribution ${transactionId}] Service not found`);
    throw new Error("Service not found");
  }

  const legacyService = service as unknown as { isActive?: boolean; bv?: number };
  const status = service.status ?? (legacyService.isActive ? "active" : "inactive");
  if (status !== "active") {
    console.error(`[BV Distribution ${transactionId}] Service is inactive`);
    throw new Error("Service is inactive");
  }

  const bv = (service.businessVolume ?? legacyService.bv) as number;
  if (!Number.isFinite(bv) || bv < 0) {
    console.error(`[BV Distribution ${transactionId}] Invalid BV: ${bv}`);
    throw new Error("Service has invalid BV");
  }

  console.log(`[BV Distribution ${transactionId}] Service BV: ${bv}`);

  const buyer = await UserModel.findById(userObjectId).select("parent").session(session);
  if (!buyer) {
    console.error(`[BV Distribution ${transactionId}] Buyer not found`);
    throw new Error("User not found");
  }

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

  console.log(`[BV Distribution ${transactionId}] Walking referral chain from buyer ${userObjectId}`);

  while (parentId) {
    const parentKey = parentId.toString();
    if (visited.has(parentKey)) {
      console.error(`[BV Distribution ${transactionId}] Circular reference detected at level ${level}`);
      throw new Error("Circular reference detected in referral chain");
    }
    visited.add(parentKey);

    console.log(`[BV Distribution ${transactionId}] Level ${level}: Parent ${parentKey} receives ${incomeAmount.toFixed(2)} (${(incomeAmount / bv * 100).toFixed(2)}% of BV)`);

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
      console.error(`[BV Distribution ${transactionId}] Referral chain exceeded MAX_LEVELS`);
      throw new Error("Referral chain too deep or corrupt");
    }

    const parent = await UserModel.findById(parentId).select("parent").session(session);
    parentId = parent?.parent ? new mongoose.Types.ObjectId(parent.parent) : null;

    level += 1;
    if (!rule.decayEnabled) {
      console.log(`[BV Distribution ${transactionId}] Decay disabled, stopping at level 1`);
      break;
    }

    incomeAmount /= 2;
  }

  if (logs.length > 0) {
    console.log(`[BV Distribution ${transactionId}] Creating ${logs.length} income logs`);
    await IncomeLogModel.insertMany(logs, { session });
  } else {
    console.log(`[BV Distribution ${transactionId}] No referral parents found, no income distributed`);
  }

  if (purchaseObjectId && incomes.length > 0) {
    console.log(`[BV Distribution ${transactionId}] Creating ${incomes.length} income records and updating user totals`);
    await IncomeModel.insertMany(incomes, { session });
    
    // Update totalIncome for each recipient user atomically
    for (const income of incomes) {
      await UserModel.updateOne(
        { _id: income.toUser },
        { 
          $inc: { 
            totalIncome: income.amount,
            totalBV: income.bv 
          } 
        },
        { session }
      );
      console.log(`[BV Distribution ${transactionId}] Updated User ${income.toUser}: +${income.amount.toFixed(2)} income, +${income.bv} BV`);
    }
  }

  console.log(`[BV Distribution ${transactionId}] Distribution completed: ${logs.length} levels paid, total BV: ${bv}`);

  return {
    bv,
    logsCreated: logs.length,
    levelsPaid: logs.length,
  };
}

/**
 * Distribute Business Volume (BV) income up the referral chain.
 *
 * Best Practices Implemented:
 * - MongoDB transactions for atomicity and rollback safety
 * - Atomic updates using $inc operator to prevent race conditions
 * - Circular reference detection to prevent infinite loops
 * - MAX_LEVELS guard against corrupt referral graphs
 * - Comprehensive audit logging for debugging and compliance
 * - Batch operations (insertMany) for performance
 * - Session-based operations for transaction consistency
 *
 * Business Rules:
 * - Input: userId (buyer), serviceId
 * - Fetch service BV (business volume)
 * - Traverse referral parents upward
 * - Level 1 gets basePercentage (default 5%) of BV
 * - Each next level gets half of previous (if decay enabled)
 * - Stop when parent is null or decay disabled
 * - Store income logs and income records in MongoDB
 * - Atomically update each recipient's totalIncome and totalBV
 *
 * @param options Configuration with userId and serviceId
 * @returns Distribution result with BV, logs created, and levels paid
 * @throws Error if service not found, inactive, or invalid BV
 * @throws Error if circular reference detected in referral chain
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
 * Useful for "purchase + income distribution" in a single atomic operation.
 *
 * Key Features:
 * - Participates in existing transaction (no new session created)
 * - Links income records to purchase via purchaseId
 * - Maintains transactional integrity with parent operation
 * - Enables rollback of entire purchase flow on any failure
 *
 * @param options Configuration including existing session and optional purchaseId
 * @returns Distribution result with BV, logs created, and levels paid
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
