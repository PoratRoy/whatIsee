'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/schema/User';
import Series from '@/models/schema/Series';
import Category from '@/models/schema/Category';

export interface CreateSeriesData {
  title: string;
  image?: string;
  categories: string[];
  tags: string[];
  seasons: number;
}

export async function createSeries(seriesData: CreateSeriesData): Promise<{
  success: boolean;
  series?: {
    _id: string;
    title: string;
    image?: string;
    categories: string[];
    tags: string[];
    seasons: number;
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
    if (!seriesData.title || seriesData.title.trim().length === 0) {
      return {
        success: false,
        error: 'Series title is required',
      };
    }

    if (seriesData.title.trim().length > 200) {
      return {
        success: false,
        error: 'Series title cannot exceed 200 characters',
      };
    }

    if (!seriesData.seasons || seriesData.seasons < 1 || seriesData.seasons > 100) {
      return {
        success: false,
        error: 'Number of seasons must be between 1 and 100',
      };
    }

    // Connect to database
    await dbConnect();

    // Ensure models are registered
    Series;
    Category;
    User;

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

    // Validate categories belong to user
    if (seriesData.categories.length > 0) {
      const userCategoryIds = user.categories.map((id: any) => id.toString());
      const invalidCategories = seriesData.categories.filter(
        (categoryId) => !userCategoryIds.includes(categoryId)
      );

      if (invalidCategories.length > 0) {
        return {
          success: false,
          error: 'One or more selected categories do not belong to the user',
        };
      }
    }

    // Check if series with same title already exists for this user
    const existingSeries = await Series.findOne({
      _id: { $in: user.series },
      title: { $regex: new RegExp(`^${seriesData.title.trim()}$`, 'i') },
    });

    if (existingSeries) {
      return {
        success: false,
        error: 'A series with this title already exists in your collection',
      };
    }

    // Create new series
    const newSeries = new Series({
      title: seriesData.title.trim(),
      image: seriesData.image?.trim() || undefined,
      categories: seriesData.categories,
      tags: seriesData.tags.filter((tag) => tag.trim().length > 0),
      seasons: seriesData.seasons,
    });

    await newSeries.save();

    // Add series to user's series
    user.series.push(newSeries._id);
    await user.save();

    return {
      success: true,
      series: {
        _id: newSeries._id.toString(),
        title: newSeries.title,
        image: newSeries.image,
        categories: newSeries.categories.map((id: any) => id.toString()),
        tags: newSeries.tags,
        seasons: newSeries.seasons,
        createdAt: newSeries.createdAt.toISOString(),
        updatedAt: newSeries.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error('Error creating series:', error);

    // Handle duplicate key error (in case of race condition)
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return {
        success: false,
        error: 'A series with this title already exists',
      };
    }

    return {
      success: false,
      error: 'Failed to create series',
    };
  }
}
