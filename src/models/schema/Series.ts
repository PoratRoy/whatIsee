import mongoose, { Document, Schema } from 'mongoose';
import { ICategory } from './Category';

export interface ISeries extends Document {
  title: string;
  image?: string;
  categories: ICategory['_id'][];
  tags: string[];
  seasons: number;
  createdAt: Date;
  updatedAt: Date;
}

const SeriesSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Series title is required'],
      trim: true,
      maxlength: [200, 'Series title cannot exceed 200 characters'],
    },
    image: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          // Basic URL validation for image
          return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
        },
        message: 'Image must be a valid URL ending with image extension',
      },
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [50, 'Tag cannot exceed 50 characters'],
      },
    ],
    seasons: {
      type: Number,
      required: [true, 'Number of seasons is required'],
      min: [1, 'Series must have at least 1 season'],
      max: [100, 'Series cannot have more than 100 seasons'],
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
SeriesSchema.index({ title: 1 });
SeriesSchema.index({ categories: 1 });
SeriesSchema.index({ tags: 1 });
SeriesSchema.index({ seasons: 1 });

export default mongoose.models.Series ||
  mongoose.model<ISeries>('Series', SeriesSchema);
