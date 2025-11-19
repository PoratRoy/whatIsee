'use server';

export interface TMDBMovieResult {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
}

export interface BrowseMoviesResponse {
  success: boolean;
  movies?: TMDBMovieResult[];
  totalPages?: number;
  currentPage?: number;
  error?: string;
}

export async function browseMovies(page: number = 1): Promise<BrowseMoviesResponse> {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    
    if (!apiKey) {
      return {
        success: false,
        error: 'TMDB API key not configured',
      };
    }

    // Generate random parameters for variety
    const randomPage = Math.floor(Math.random() * 100) + 1; // Random page 1-100
    const currentYear = new Date().getFullYear();
    const randomYear = Math.floor(Math.random() * (currentYear - 1980)) + 1980; // Random year 1980-current
    const sortOptions = [
      'popularity.desc',
      'vote_average.desc',
      'release_date.desc',
      'revenue.desc'
    ];
    const randomSort = sortOptions[Math.floor(Math.random() * sortOptions.length)];

    // Use discover endpoint for more variety
    const discoverUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&page=${page === 1 ? randomPage : page}&language=en-US&sort_by=${randomSort}&primary_release_year=${randomYear}&vote_count.gte=100&with_original_language=en`;

    const response = await fetch(discoverUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Remove caching to ensure fresh random results
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        success: false,
        error: `TMDB API error: ${response.status}`,
      };
    }

    const data = await response.json();

    // Shuffle the results for additional randomness
    const shuffledMovies = (data.results || []).sort(() => Math.random() - 0.5);

    return {
      success: true,
      movies: shuffledMovies,
      totalPages: Math.min(data.total_pages || 1, 20), // Limit to 20 pages for performance
      currentPage: page,
    };
  } catch (error) {
    console.error('Error browsing movies:', error);
    return {
      success: false,
      error: 'Failed to fetch movies from TMDB',
    };
  }
}
