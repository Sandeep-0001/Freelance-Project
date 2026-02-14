import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const ruleSchema = new Schema(
  {
    // Level-1 payout is: purchaseBV * basePayoutPerBV
    basePayoutPerBV: { type: Number, required: true, min: 0 },

    // Hard cap to prevent accidental unbounded payouts.
    maxLevels: { type: Number, required: true, min: 1, default: 20 },

    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export type Rule = InferSchemaType<typeof ruleSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const RuleModel: Model<Rule> =
  (mongoose.models.Rule as Model<Rule>) || mongoose.model<Rule>("Rule", ruleSchema);
