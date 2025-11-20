import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITag extends Document {
  _id: Types.ObjectId;
  name: string;
  color?: string;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: [true, 'Tag name is required'],
      trim: true,
      maxlength: [50, 'Tag name cannot exceed 50 characters'],
    },
    color: {
      type: String,
      trim: true,
      match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color code'],
      default: '#6B7280', // Default gray color
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc: any, ret: any) {
        ret._id = ret._id.toString();
        if (ret.user) {
          ret.user = ret.user.toString();
        }
        return ret;
      },
    },
  }
);

// Compound index to ensure unique tag names per user
TagSchema.index({ name: 1, user: 1 }, { unique: true });

// Index for efficient querying by user
TagSchema.index({ user: 1 });

const Tag = mongoose.models.Tag || mongoose.model<ITag>('Tag', TagSchema);

export default Tag;
