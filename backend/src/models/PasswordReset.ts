import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const passwordResetSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-delete expired OTPs
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type PasswordReset = InferSchemaType<typeof passwordResetSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const PasswordResetModel: Model<PasswordReset> =
  mongoose.models.PasswordReset ?? mongoose.model("PasswordReset", passwordResetSchema);
