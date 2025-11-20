'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import {
  getAllUserMovies,
  type MovieData,
} from '@/app/actions/getAllUserMovies';
import {
  getAllUserSeries,
  type SeriesData,
} from '@/app/actions/getAllUserSeries';
import {
  getAllUserCategories,
  type CategoryData,
} from '@/app/actions/getAllUserCategories';
import {
  getAllUserTags,
  type TagData,
} from '@/app/actions/getAllUserTags';

interface DataContextType {
  movies: MovieData[];
  series: SeriesData[];
  categories: CategoryData[];
  tags: TagData[];
  isLoading: boolean;
  error: string | null;
  refetchMovies: () => Promise<void>;
  refetchSeries: () => Promise<void>;
  refetchCategories: () => Promise<void>;
  refetchTags: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { session, status } = useAuth();
  const [movies, setMovies] = useState<MovieData[]>([]);
  const [series, setSeries] = useState<SeriesData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [tags, setTags] = useState<TagData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMovies = async () => {
    if (status !== 'authenticated' || !session) {
      setMovies([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getAllUserMovies();

      if (result.success && result.movies) {
        setMovies(result.movies);
      } else {
        setError(result.error || 'Failed to fetch movies');
        setMovies([]);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setMovies([]);
      console.error('Error fetching movies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSeries = async () => {
    if (status !== 'authenticated' || !session) {
      setSeries([]);
      return;
    }

    try {
      const result = await getAllUserSeries();

      if (result.success && result.series) {
        setSeries(result.series);
      } else {
        console.error('Failed to fetch series:', result.error);
        setSeries([]);
      }
    } catch (err) {
      console.error('Error fetching series:', err);
      setSeries([]);
    }
  };

  const fetchCategories = async () => {
    if (status !== 'authenticated' || !session) {
      setCategories([]);
      return;
    }

    try {
      const result = await getAllUserCategories();

      if (result.categories) {
        setCategories(result.categories);
      } else {
        console.error('Failed to fetch categories:', result.error);
        setCategories([]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  };

  const fetchTags = async () => {
    if (status !== 'authenticated' || !session) {
      setTags([]);
      return;
    }

    try {
      const result = await getAllUserTags();

      if (result.success && result.tags) {
        setTags(result.tags);
      } else {
        console.error('Failed to fetch tags:', result.error);
        setTags([]);
      }
    } catch (err) {
      console.error('Error fetching tags:', err);
      setTags([]);
    }
  };

  const refetchMovies = async () => {
    await fetchMovies();
  };

  const refetchSeries = async () => {
    await fetchSeries();
  };

  const refetchCategories = async () => {
    await fetchCategories();
  };

  const refetchTags = async () => {
    await fetchTags();
  };

  useEffect(() => {
    fetchMovies();
    fetchSeries();
    fetchCategories();
    fetchTags();
  }, [session, status]);

  return (
    <DataContext.Provider
      value={{
        movies,
        series,
        categories,
        tags,
        isLoading,
        error,
        refetchMovies,
        refetchSeries,
        refetchCategories,
        refetchTags,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
