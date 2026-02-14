import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export type UserRole = "super_admin" | "admin" | "moderator" | "user";

export type BinaryPosition = "left" | "right";

export type UserStatus = "active" | "suspended" | "deleted";

export type UserActivityStatus = "active" | "inactive";

const userSchema = new Schema(
  {
    // Signup Fields
    mobile: { type: String, required: true, unique: true, trim: true },
    countryCode: { type: String, default: "+91", trim: true },
    name: { type: String, trim: true, default: "" },
    email: { type: String, unique: true, lowercase: true, trim: true, sparse: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["super_admin", "admin", "moderator", "user"], required: true, default: "user" },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },

    // Business Settings (Profile Fields)
    businessName: { type: String, trim: true },
    companyPhone: { type: String, trim: true },
    companyEmail: { type: String, lowercase: true, trim: true },
    website: { type: String, trim: true },
    billingAddress: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    city: { type: String, trim: true },
    language: { type: String, trim: true },
    businessType: { type: String, trim: true },
    industryType: { type: String, trim: true },
    businessDescription: { type: String, trim: true },
    gstin: { type: String, trim: true },
    isGSTRegistered: { type: Boolean, default: false },
    enableEInvoicing: { type: Boolean, default: false },
    enableTDS: { type: Boolean, default: false },
    enableTCS: { type: Boolean, default: false },
    businessLogo: { type: String, trim: true },
    signature: { type: String, trim: true },
    currencyCode: { type: String, default: "INR", trim: true },
    currencySymbol: { type: String, default: "₹", trim: true },

    // Account status: active, suspended (blocked by admin), deleted (soft delete)
    status: { type: String, enum: ["active", "suspended", "deleted"], default: "active", index: true },
    
    // Activity status: tracks if user is currently logged in (active) or logged out (inactive)
    activityStatus: { type: String, enum: ["active", "inactive"], default: "inactive", index: true },
    
    // Login tracking
    lastLoginAt: { type: Date, default: null },
    lastLogoutAt: { type: Date, default: null },
    
    // Session expiry: when set, user cannot login after this date
    sessionExpiresAt: { type: Date, default: null },

    // Unique code this user shares with new signups.
    referralCode: { type: String, required: true, unique: true, index: true },

    // The user who referred this user (nullable for root/admin accounts).
    parent: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },

    // Binary placement position under `parent`.
    // - null when parent is null (root)
    // - each parent can have at most 1 left + 1 right child
    position: { type: String, enum: ["left", "right"], default: null, index: true },

    // KYC Information
    kycStatus: { type: String, enum: ["pending", "submitted", "verified", "rejected"], default: "pending" },
    kycSubmittedAt: { type: Date, default: null },
    kycVerifiedAt: { type: Date, default: null },
    kycRejectedAt: { type: Date, default: null },
    kycRejectionReason: { type: String, trim: true },
    
    // Personal Information for KYC
    fullName: { type: String, required: true, trim: true },
    fatherName: { type: String, trim: true },
    address: { type: String, trim: true },
    dob: { type: Date, default: null },
    occupation: { type: String, trim: true },
    incomeSlab: { type: String, trim: true },
    
    // KYC Documents
    profileImage: { type: String, trim: true }, // Profile/avatar image uploaded by user
    panNumber: { type: String, trim: true, uppercase: true },
    panDocument: { type: String, trim: true },
    aadhaarNumber: { type: String, trim: true },
    aadhaarDocument: { type: String, trim: true },
    
    // Bank Details
    bankAccountName: { type: String, trim: true },
    bankAccountNumber: { type: String, trim: true },
    bankName: { type: String, trim: true },
    bankAddress: { type: String, trim: true },
    bankIfsc: { type: String, trim: true, uppercase: true },
    bankDocument: { type: String, trim: true },
    
    // Nominees
    nominees: [{
      relation: { type: String, required: true, trim: true },
      name: { type: String, required: true, trim: true },
      dob: { type: Date, required: true },
      mobile: { type: String, required: true, trim: true }
    }],

    // Payment Settings (for admin)
    paymentLinkEnabled: { type: Boolean, default: false },
    upiLink: { type: String, trim: true },
  },
  { timestamps: true }
);

// Additional indexes for better query performance
userSchema.index({ isVerified: 1 });
userSchema.index({ isBlocked: 1 });

// Enforce binary constraint: a given parent can have only one left child and one right child.
// Using a partial index keeps multiple root users (parent=null) from conflicting.
userSchema.index(
  { parent: 1, position: 1 },
  {
    unique: true,
    partialFilterExpression: { parent: { $type: "objectId" }, position: { $in: ["left", "right"] } },
  }
);

export type User = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const UserModel: Model<User> =
  (mongoose.models.User as Model<User>) || mongoose.model<User>("User", userSchema);
