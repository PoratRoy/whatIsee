'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/schema/User';
import Movie from '@/models/schema/Movie';
import Category from '@/models/schema/Category';

export interface CreateMovieData {
  title: string;
  image?: string;
  categories: string[];
  tags: string[];
  watchedStatus?: 'watched' | 'to_watch';
}

export async function createMovie(movieData: CreateMovieData): Promise<{
  success: boolean;
  movie?: {
    _id: string;
    title: string;
    image?: string;
    categories: string[];
    tags: string[];
    watchedStatus: 'watched' | 'to_watch';
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
    if (!movieData.title || movieData.title.trim().length === 0) {
      return {
        success: false,
        error: 'Movie title is required',
      };
    }

    if (movieData.title.trim().length > 200) {
      return {
        success: false,
        error: 'Movie title cannot exceed 200 characters',
      };
    }

    // Connect to database
    await dbConnect();

    // Ensure models are registered
    Movie;
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
    if (movieData.categories.length > 0) {
      const userCategoryIds = user.categories.map((id: any) => id.toString());
      const invalidCategories = movieData.categories.filter(
        (categoryId) => !userCategoryIds.includes(categoryId)
      );

      if (invalidCategories.length > 0) {
        return {
          success: false,
          error: 'One or more selected categories do not belong to the user',
        };
      }
    }

    // Check if movie with same title already exists for this user
    const existingMovie = await Movie.findOne({
      _id: { $in: user.movies },
      title: { $regex: new RegExp(`^${movieData.title.trim()}$`, 'i') },
    });

    if (existingMovie) {
      return {
        success: false,
        error: 'A movie with this title already exists in your collection',
      };
    }

    // Create new movie
    const newMovie = new Movie({
      title: movieData.title.trim(),
      image: movieData.image?.trim() || undefined,
      categories: movieData.categories,
      tags: movieData.tags.filter((tag) => tag.trim().length > 0),
      watchedStatus: movieData.watchedStatus || 'watched',
    });

    await newMovie.save();

    // Add movie to user's movies
    user.movies.push(newMovie._id);
    await user.save();

    return {
      success: true,
      movie: {
        _id: newMovie._id.toString(),
        title: newMovie.title,
        image: newMovie.image,
        categories: newMovie.categories.map((id: any) => id.toString()),
        tags: newMovie.tags,
        watchedStatus: newMovie.watchedStatus,
        createdAt: newMovie.createdAt.toISOString(),
        updatedAt: newMovie.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error('Error creating movie:', error);

    // Handle duplicate key error (in case of race condition)
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return {
        success: false,
        error: 'A movie with this title already exists',
      };
    }

    return {
      success: false,
      error: 'Failed to create movie',
    };
  }
}
