import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const incomeSchema = new Schema(
  {
    fromUser: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    toUser: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    purchase: { type: Schema.Types.ObjectId, ref: "Purchase", required: true, index: true },

    level: { type: Number, required: true, min: 1 },
    bv: { type: Number, required: true, min: 0 },

    // Money amount (currency-agnostic). Store as number for simplicity;
    // for real money, prefer decimals (or integer minor units) to avoid float drift.
    amount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export type Income = InferSchemaType<typeof incomeSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const IncomeModel: Model<Income> =
  (mongoose.models.Income as Model<Income>) ||
  mongoose.model<Income>("Income", incomeSchema);
