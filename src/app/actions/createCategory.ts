'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/schema/User';
import Category from '@/models/schema/Category';

export async function createCategory(title: string): Promise<{
  success: boolean;
  category?: {
    _id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  error?: string;
}> {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // Validate input
    if (!title || title.trim().length === 0) {
      return {
        success: false,
        error: 'Category title is required',
      };
    }

    if (title.trim().length > 100) {
      return {
        success: false,
        error: 'Category title cannot exceed 100 characters',
      };
    }

    // Connect to database
    await dbConnect();

    // Ensure models are registered
    Category;
    User;

    // Check if category already exists for this user
    const user = await User.findOne({
      'googleCredentials.email': session.user.email,
    }).populate('categories');

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Check for duplicate category names
    const existingCategory = user.categories.find(
      (cat: any) => cat.title.toLowerCase() === title.trim().toLowerCase()
    );

    if (existingCategory) {
      return {
        success: false,
        error: 'A category with this name already exists',
      };
    }

    // Create new category
    const newCategory = new Category({
      title: title.trim(),
    });

    await newCategory.save();

    // Add category to user's categories
    user.categories.push(newCategory._id);
    await user.save();

    return {
      success: true,
      category: {
        _id: newCategory._id.toString(),
        name: newCategory.title,
        createdAt: newCategory.createdAt.toISOString(),
        updatedAt: newCategory.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error('Error creating category:', error);

    // Handle duplicate key error (in case of race condition)
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return {
        success: false,
        error: 'A category with this name already exists',
      };
    }

    return {
      success: false,
      error: 'Failed to create category',
    };
  }
}
