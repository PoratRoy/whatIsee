'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/schema/User';
import Movie from '@/models/schema/Movie';

export async function deleteMovie(movieId: string): Promise<{
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
    if (!movieId || movieId.trim().length === 0) {
      return {
        success: false,
        error: 'Movie ID is required',
      };
    }

    // Connect to database
    await dbConnect();

    // Ensure models are registered
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

    // Check if movie belongs to user
    if (!user.movies.includes(movieId)) {
      return {
        success: false,
        error: 'Movie not found or does not belong to user',
      };
    }

    // Remove movie from user's movies array
    user.movies = user.movies.filter(
      (movId: any) => movId.toString() !== movieId
    );
    await user.save();

    // Delete the movie document
    await Movie.findByIdAndDelete(movieId);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting movie:', error);
    return {
      success: false,
      error: 'Failed to delete movie',
    };
  }
}
