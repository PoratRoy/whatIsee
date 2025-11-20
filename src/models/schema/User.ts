import mongoose, { Document, Schema } from 'mongoose';
import { IMovie } from './Movie';
import { ISeries } from './Series';
import { ICategory } from './Category';
import { ITag } from './Tag';

export interface IGoogleCredentials {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
}

export interface IUser extends Document {
  name: string;
  googleCredentials: IGoogleCredentials;
  movies: IMovie['_id'][];
  series: ISeries['_id'][];
  categories: ICategory['_id'][];
  tags: ITag['_id'][];
  createdAt: Date;
  updatedAt: Date;
}

const GoogleCredentialsSchema: Schema = new Schema(
  {
    googleId: {
      type: String,
      required: [true, 'Google ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please enter a valid email address',
      },
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    picture: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Picture must be a valid URL',
      },
    },
  },
  { _id: false }
);

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    googleCredentials: {
      type: GoogleCredentialsSchema,
      required: [true, 'Google credentials are required'],
    },
    movies: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Movie',
      },
    ],
    series: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Series',
      },
    ],
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Note: Indexes are managed by NextAuth MongoDBAdapter
// Manual indexes removed to avoid conflicts

export default mongoose.models.User ||
  mongoose.model<IUser>('User', UserSchema);
