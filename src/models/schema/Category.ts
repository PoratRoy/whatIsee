import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Category title is required'],
      trim: true,
      maxlength: [100, 'Category title cannot exceed 100 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Create unique index for better performance
CategorySchema.index({ title: 1 }, { unique: true });

export default mongoose.models.Category ||
  mongoose.model<ICategory>('Category', CategorySchema);
