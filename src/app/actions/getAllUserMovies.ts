'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/schema/User';
import Movie from '@/models/schema/Movie';
import Category from '@/models/schema/Category';
import Tag from '@/models/schema/Tag';

export interface TagData {
  _id: string;
  name: string;
  color: string;
}

export interface MovieData {
  _id: string;
  title: string;
  image?: string;
  categories: string[];
  tags: TagData[];
  watchedStatus: 'watched' | 'to_watch';
  createdAt: string;
  updatedAt: string;
}

export async function getAllUserMovies(): Promise<{
  success: boolean;
  movies?: MovieData[];
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
    Movie;
    Category;

    // Find user by email
    const user = await User.findOne({
      'googleCredentials.email': session.user.email,
    }).populate({
      path: 'movies',
      model: Movie,
      populate: [
        {
          path: 'categories',
          model: Category,
          select: 'title',
        },
        {
          path: 'tags',
          model: Tag,
          select: 'name color',
        },
      ],
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Transform movies data for client
    const movies: MovieData[] = user.movies.map((movie: any) => ({
      _id: movie._id.toString(),
      title: movie.title,
      image: movie.image,
      categories: movie.categories.map((cat: any) => cat.title),
      tags: movie.tags.map((tag: any) => ({
        _id: tag._id.toString(),
        name: tag.name,
        color: tag.color || '#6B7280',
      })),
      watchedStatus: movie.watchedStatus || 'watched',
      createdAt: movie.createdAt.toISOString(),
      updatedAt: movie.updatedAt.toISOString(),
    }));

    return {
      success: true,
      movies,
    };
  } catch (error) {
    console.error('Error fetching user movies:', error);
    return {
      success: false,
      error: 'Failed to fetch movies',
    };
  }
}
