import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { createId } from "@paralleldrive/cuid2";

const categorySchema = new Schema(
  {
    _id: { type: String, default: createId },
    name: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 100 
    },
    
    // SEO-friendly URL slug
    slug: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true, 
      lowercase: true,
      maxlength: 100 
    },
    
    // Unique category code
    code: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true,
      uppercase: true,
      maxlength: 10 
    },
    
    // Icon for UI (SVG URL or icon name)
    icon: { 
      type: String, 
      trim: true 
    },
    
    // Optional banner/thumbnail image
    image: { 
      type: String, 
      trim: true 
    },
    
    // Active status
    isActive: { 
      type: Boolean, 
      default: true,
      index: true 
    },
    
    // Sort order for display
    sortOrder: { 
      type: Number, 
      default: 0,
      min: 0 
    },
  },
  { 
    timestamps: true,
    // Indexes for better query performance
    index: [
      { name: 1, unique: true },
      { code: 1, unique: true },
      { sortOrder: 1 },
      { isActive: 1, sortOrder: 1 }
    ]
  }
);

export type Category = InferSchemaType<typeof categorySchema> & {
  _id: string;
};

export const CategoryModel: Model<Category> =
  (mongoose.models.Category as Model<Category>) ||
  mongoose.model<Category>("Category", categorySchema);
