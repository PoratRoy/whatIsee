'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/schema/User';
import Category from '@/models/schema/Category';

export interface CategoryData {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export async function getAllUserCategories(): Promise<{
  categories: CategoryData[];
  error?: string;
}> {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return {
        categories: [],
        error: 'User not authenticated',
      };
    }

    // Connect to database
    await dbConnect();

    // Find the user by email
    const user = await User.findOne({
      'googleCredentials.email': session.user.email,
    }).populate({
      path: 'categories',
      model: Category,
      select: '_id title createdAt updatedAt',
    });

    if (!user) {
      return {
        categories: [],
        error: 'User not found',
      };
    }

    // Transform the categories to plain objects
    const categories: CategoryData[] = user.categories.map((category: any) => ({
      _id: category._id.toString(),
      name: category.title, // Map title to name for consistency
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    }));

    return {
      categories,
    };
  } catch (error) {
    console.error('Error fetching user categories:', error);
    return {
      categories: [],
      error: 'Failed to fetch categories',
    };
  }
}
