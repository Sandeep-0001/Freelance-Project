import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const subcategorySchema = new Schema(
  {
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
    
    // Unique subcategory code
    code: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true,
      uppercase: true,
      maxlength: 10 
    },
    
    // Parent category reference
    categoryId: { 
      type: Schema.Types.ObjectId, 
      ref: "Category", 
      required: true 
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
      { categoryId: 1, sortOrder: 1 },
      { isActive: 1, sortOrder: 1 }
    ]
  }
);

export type Subcategory = InferSchemaType<typeof subcategorySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SubcategoryModel: Model<Subcategory> =
  (mongoose.models.Subcategory as Model<Subcategory>) ||
  mongoose.model<Subcategory>("Subcategory", subcategorySchema);
