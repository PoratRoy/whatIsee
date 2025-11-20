'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/schema/User';
import Series from '@/models/schema/Series';
import Category from '@/models/schema/Category';

export interface SeriesData {
  _id: string;
  title: string;
  image?: string;
  categories: string[];
  tags: string[];
  seasons: number;
  createdAt: string;
  updatedAt: string;
}

export async function getAllUserSeries(): Promise<{
  success: boolean;
  series?: SeriesData[];
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    await dbConnect();

    // Ensure models are registered
    Series;
    Category;

    // Find user by email
    const user = await User.findOne({
      'googleCredentials.email': session.user.email,
    }).populate({
      path: 'series',
      model: Series,
      populate: {
        path: 'categories',
        model: Category,
        select: 'title',
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Transform series data for client
    const series: SeriesData[] = user.series.map((serie: any) => ({
      _id: serie._id.toString(),
      title: serie.title,
      image: serie.image,
      categories: serie.categories.map((cat: any) => cat.title),
      tags: serie.tags,
      seasons: serie.seasons,
      createdAt: serie.createdAt.toISOString(),
      updatedAt: serie.updatedAt.toISOString(),
    }));

    return {
      success: true,
      series,
    };
  } catch (error) {
    console.error('Error fetching user series:', error);
    return {
      success: false,
      error: 'Failed to fetch series',
    };
  }
}
