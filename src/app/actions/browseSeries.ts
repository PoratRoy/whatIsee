'use server';

export interface TMDBSeriesResult {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  number_of_seasons?: number;
}

export interface BrowseSeriesResponse {
  success: boolean;
  series?: TMDBSeriesResult[];
  totalPages?: number;
  currentPage?: number;
  error?: string;
}

export async function browseSeries(page: number = 1, searchQuery?: string): Promise<BrowseSeriesResponse> {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    
    if (!apiKey) {
      return {
        success: false,
        error: 'TMDB API key not configured',
      };
    }

    let apiUrl: string;

    if (searchQuery && searchQuery.trim()) {
      // Use search endpoint for specific queries
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      apiUrl = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodedQuery}&page=${page}&language=en-US`;
    } else {
      // Generate random parameters for variety
      const randomPage = Math.floor(Math.random() * 100) + 1; // Random page 1-100
      const currentYear = new Date().getFullYear();
      const randomYear = Math.floor(Math.random() * (currentYear - 1980)) + 1980; // Random year 1980-current
      const sortOptions = [
        'popularity.desc',
        'vote_average.desc',
        'first_air_date.desc'
      ];
      const randomSort = sortOptions[Math.floor(Math.random() * sortOptions.length)];

      // Use discover endpoint for TV series with more variety
      apiUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&page=${page === 1 ? randomPage : page}&language=en-US&sort_by=${randomSort}&first_air_date_year=${randomYear}&vote_count.gte=50&with_original_language=en`;
    }

    const response = await fetch(apiUrl, {
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

    // Shuffle the results for additional randomness (only for discover mode)
    const seriesResults = data.results || [];
    const shuffledSeries = searchQuery ? seriesResults : seriesResults.sort(() => Math.random() - 0.5);

    return {
      success: true,
      series: shuffledSeries,
      totalPages: Math.min(data.total_pages || 1, 20), // Limit to 20 pages for performance
      currentPage: page,
    };
  } catch (error) {
    console.error('Error browsing series:', error);
    return {
      success: false,
      error: 'Failed to fetch series from TMDB',
    };
  }
}
