'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/schema/User';
import Tag from '@/models/schema/Tag';

export interface TagData {
  _id: string;
  name: string;
  color: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

interface GetAllUserTagsResponse {
  success: boolean;
  tags?: TagData[];
  error?: string;
}

export async function getAllUserTags(): Promise<GetAllUserTagsResponse> {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'You must be logged in to view tags',
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

    // Get all tags for the user
    const tags = await Tag.find({ user: user._id }).sort({ name: 1 });

    // Transform the data for the client
    const transformedTags: TagData[] = tags.map((tag) => ({
      _id: tag._id.toString(),
      name: tag.name,
      color: tag.color || '#6B7280',
      user: tag.user.toString(),
      createdAt: tag.createdAt.toISOString(),
      updatedAt: tag.updatedAt.toISOString(),
    }));

    return {
      success: true,
      tags: transformedTags,
    };
  } catch (error) {
    console.error('Error fetching user tags:', error);
    return {
      success: false,
      error: 'Failed to fetch tags. Please try again.',
    };
  }
}
