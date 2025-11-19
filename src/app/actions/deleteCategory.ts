'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/schema/User';
import Category from '@/models/schema/Category';
import Movie from '@/models/schema/Movie';

export async function deleteCategory(categoryId: string): Promise<{
  success: boolean;
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
    if (!categoryId || categoryId.trim().length === 0) {
      return {
        success: false,
        error: 'Category ID is required',
      };
    }

    // Connect to database
    await dbConnect();

    // Ensure models are registered
    Category;
    User;
    Movie;

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

    // Check if category belongs to user
    if (!user.categories.includes(categoryId)) {
      return {
        success: false,
        error: 'Category not found or does not belong to user',
      };
    }

    // Check if category is being used by any movies
    const moviesUsingCategory = await Movie.find({
      _id: { $in: user.movies },
      categories: categoryId,
    });

    if (moviesUsingCategory.length > 0) {
      return {
        success: false,
        error: `Cannot delete category. It is used by ${moviesUsingCategory.length} ${
          moviesUsingCategory.length === 1 ? 'movie' : 'movies'
        }. Please remove the category from all movies first.`,
      };
    }

    // Remove category from user's categories array
    user.categories = user.categories.filter(
      (catId: any) => catId.toString() !== categoryId
    );
    await user.save();

    // Delete the category document
    await Category.findByIdAndDelete(categoryId);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting category:', error);
    return {
      success: false,
      error: 'Failed to delete category',
    };
  }
}
