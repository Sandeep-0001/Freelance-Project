import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const analyticsSchema = new Schema(
  {
    // Date for which this analytics data is recorded
    date: { 
      type: Date, 
      required: true, 
      index: true 
    },
    
    // User Analytics
    totalUsers: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 },
    totalProviders: { type: Number, default: 0 },
    activeProviders: { type: Number, default: 0 },
    totalBuyers: { type: Number, default: 0 },
    activeBuyers: { type: Number, default: 0 },
    newRegistrations: { type: Number, default: 0 },
    newProviders: { type: Number, default: 0 },
    newBuyers: { type: Number, default: 0 },
    
    // Service Analytics
    totalServices: { type: Number, default: 0 },
    pendingServices: { type: Number, default: 0 },
    approvedServices: { type: Number, default: 0 },
    rejectedServices: { type: Number, default: 0 },
    activeServices: { type: Number, default: 0 },
    
    // Inquiry Analytics
    totalInquiries: { type: Number, default: 0 },
    pendingInquiries: { type: Number, default: 0 },
    completedInquiries: { type: Number, default: 0 },
    
    // Revenue Analytics
    totalRevenue: { type: Number, default: 0 },
    dailyRevenue: { type: Number, default: 0 },
    
    // Additional metrics
    totalBusinessVolume: { type: Number, default: 0 },
    dailyBusinessVolume: { type: Number, default: 0 },
  },
  { 
    timestamps: true,
    // Ensure one record per date
    index: [
      { date: 1, unique: true }
    ]
  }
);

export type Analytics = InferSchemaType<typeof analyticsSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const AnalyticsModel: Model<Analytics> =
  (mongoose.models.Analytics as Model<Analytics>) ||
  mongoose.model<Analytics>("Analytics", analyticsSchema);
