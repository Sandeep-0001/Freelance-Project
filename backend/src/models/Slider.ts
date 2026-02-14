import mongoose, { Document, Schema } from 'mongoose';

export interface ISlider extends Document {
  title: string;
  description?: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SliderSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
SliderSchema.index({ order: 1 });
SliderSchema.index({ isActive: 1 });

export const Slider = mongoose.models.Slider || mongoose.model<ISlider>('Slider', SliderSchema);
