import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * Purchase Model - Records service purchases and tracks commission distribution
 * 
 * Best Practices Implemented:
 * - Status tracking: pending -> completed/failed for audit trail
 * - Idempotency: Optional idempotencyKey prevents duplicate requests
 * - Compound indexes: Efficient queries for user purchases and duplicate detection
 * - Failure tracking: failureReason stores error details for debugging
 * - Timestamps: Auto-generated createdAt and updatedAt fields
 * - Validation: Enum constraints and min values ensure data integrity
 * 
 * Indexes:
 * 1. user (single): Fast lookup of all user purchases
 * 2. service (single): Fast lookup of all purchases for a service
 * 3. status (single): Filter by purchase status
 * 4. idempotencyKey (unique, sparse): Prevent duplicate idempotent requests
 * 5. {user, service, createdAt} (compound): Detect recent duplicate purchases
 */
const purchaseSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    service: { type: String, ref: "Service", required: true, index: true },
    bv: { type: Number, required: true, min: 0 },
    status: { 
      type: String, 
      enum: ["pending", "completed", "failed"], 
      default: "pending",
      index: true 
    },
    idempotencyKey: { type: String, unique: true, sparse: true },
    failureReason: { type: String },
  },
  { timestamps: true }
);

// Compound index for preventing rapid duplicate purchases of same service
purchaseSchema.index({ user: 1, service: 1, createdAt: -1 });

export type Purchase = InferSchemaType<typeof purchaseSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const PurchaseModel: Model<Purchase> =
  (mongoose.models.Purchase as Model<Purchase>) ||
  mongoose.model<Purchase>("Purchase", purchaseSchema);
