import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { createId } from "@paralleldrive/cuid2";

const serviceSchema = new Schema(
  {
    _id: { type: String, default: createId },
    name: { type: String, required: true, trim: true },
    
    // SEO-friendly URL slug
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    
    // Service image
    image: { type: String, required: true },
    
    // Additional images gallery
    gallery: [{ type: String }],
    
    // Price for purchasing the service
    price: { type: Number, required: true, min: 0 },
    
    // Original price for discount display
    originalPrice: { type: Number, min: 0 },
    
    // Currency support
    currency: { type: String, enum: ["INR", "USD"], default: "INR" },
    
    // Discount percentage
    discountPercent: { type: Number, min: 0, max: 100 },

    // Business Volume (BV) for this service purchase
    businessVolume: { type: Number, required: true, min: 0 },

    // Short description for previews
    shortDescription: { type: String, trim: true, maxlength: 200 },
    
    // Full description
    description: { type: String, trim: true },

    // Service status
    status: { 
      type: String, 
      enum: ["active", "inactive", "out_of_stock"], 
      default: "active", 
      index: true 
    },
    
    // Featured flag for highlighting
    isFeatured: { type: Boolean, default: false },
    
    // Category reference
    categoryId: { type: String, ref: "Category" },
    
    // Tags for filtering and search
    tags: [{ type: String, trim: true }],
    
    // Rating and reviews
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
);

// Indexes for better query performance
// Note: slug index is created automatically via unique: true constraint above
serviceSchema.index({ status: 1, isFeatured: 1 });
serviceSchema.index({ categoryId: 1 });
serviceSchema.index({ tags: 1 });
serviceSchema.index({ rating: -1 });

export type Service = InferSchemaType<typeof serviceSchema> & {
  _id: string;
};

export const ServiceModel: Model<Service> =
  (mongoose.models.Service as Model<Service>) ||
  mongoose.model<Service>("Service", serviceSchema);
