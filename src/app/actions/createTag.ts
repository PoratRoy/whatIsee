'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/schema/User';
import Tag from '@/models/schema/Tag';

interface CreateTagData {
  name: string;
  color?: string;
}

interface CreateTagResponse {
  success: boolean;
  tag?: {
    _id: string;
    name: string;
    color: string;
    user: string;
    createdAt: string;
    updatedAt: string;
  };
  error?: string;
}

export async function createTag(data: CreateTagData): Promise<CreateTagResponse> {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'You must be logged in to create tags',
      };
    }

    // Connect to database
    await dbConnect();

    // Find the user
    const user = await User.findOne({
      'googleCredentials.email': session.user.email,
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Validate tag data
    if (!data.name || data.name.trim().length === 0) {
      return {
        success: false,
        error: 'Tag name is required',
      };
    }

    if (data.name.trim().length > 50) {
      return {
        success: false,
        error: 'Tag name cannot exceed 50 characters',
      };
    }

    // Validate color format if provided
    if (data.color && !/^#[0-9A-F]{6}$/i.test(data.color)) {
      return {
        success: false,
        error: 'Color must be a valid hex color code (e.g., #FF6B6B)',
      };
    }

    // Check if tag with same name already exists for this user
    const existingTag = await Tag.findOne({
      name: data.name.trim(),
      user: user._id,
    });

    if (existingTag) {
      return {
        success: false,
        error: 'A tag with this name already exists',
      };
    }

    // Create the new tag
    const newTag = new Tag({
      name: data.name.trim(),
      color: data.color || '#6B7280', // Default gray color
      user: user._id,
    });

    await newTag.save();

    // Add tag to user's tags array
    await User.findByIdAndUpdate(user._id, {
      $push: { tags: newTag._id },
    });

    return {
      success: true,
      tag: {
        _id: newTag._id.toString(),
        name: newTag.name,
        color: newTag.color || '#6B7280',
        user: newTag.user.toString(),
        createdAt: newTag.createdAt.toISOString(),
        updatedAt: newTag.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error('Error creating tag:', error);
    
    // Handle duplicate key error (unique constraint violation)
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      return {
        success: false,
        error: 'A tag with this name already exists',
      };
    }
    
    return {
      success: false,
      error: 'Failed to create tag. Please try again.',
    };
  }
}
