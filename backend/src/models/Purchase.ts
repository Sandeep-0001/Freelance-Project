import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const purchaseSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    service: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    bv: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export type Purchase = InferSchemaType<typeof purchaseSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const PurchaseModel: Model<Purchase> =
  (mongoose.models.Purchase as Model<Purchase>) ||
  mongoose.model<Purchase>("Purchase", purchaseSchema);
