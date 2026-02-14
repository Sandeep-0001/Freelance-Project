import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const distributionRuleSchema = new Schema(
  {
    // Base percentage of BV paid at level 1.
    // Stored as a fraction: 0.10 = 10%.
    basePercentage: { type: Number, required: true, min: 0, max: 1 },

    // If enabled, each next level receives half of the previous level's amount.
    // If disabled, only level 1 is paid.
    decayEnabled: { type: Boolean, default: true },

    // Only one rule should be active at a time; new updates should create a new active rule.
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

distributionRuleSchema.index({ isActive: 1, createdAt: -1 });

export type DistributionRule = InferSchemaType<typeof distributionRuleSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const DistributionRuleModel: Model<DistributionRule> =
  (mongoose.models.DistributionRule as Model<DistributionRule>) ||
  mongoose.model<DistributionRule>("DistributionRule", distributionRuleSchema);
