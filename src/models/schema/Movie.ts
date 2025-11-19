import mongoose, { Document, Schema } from 'mongoose';
import { ICategory } from './Category';

export interface IMovie extends Document {
  title: string;
  image?: string;
  categories: ICategory['_id'][];
  tags: string[];
  watchedStatus: 'watched' | 'to_watch';
  createdAt: Date;
  updatedAt: Date;
}

const MovieSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      maxlength: [200, 'Movie title cannot exceed 200 characters'],
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
    watchedStatus: {
      type: String,
      enum: ['watched', 'to_watch'],
      default: 'watched',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
MovieSchema.index({ title: 1 });
MovieSchema.index({ categories: 1 });
MovieSchema.index({ tags: 1 });
MovieSchema.index({ watchedStatus: 1 });

export default mongoose.models.Movie ||
  mongoose.model<IMovie>('Movie', MovieSchema);
