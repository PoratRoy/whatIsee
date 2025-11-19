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
  getAllUserCategories,
  type CategoryData,
} from '@/app/actions/getAllUserCategories';

interface DataContextType {
  movies: MovieData[];
  categories: CategoryData[];
  isLoading: boolean;
  error: string | null;
  refetchMovies: () => Promise<void>;
  refetchCategories: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { session, status } = useAuth();
  const [movies, setMovies] = useState<MovieData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
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

  const refetchMovies = async () => {
    await fetchMovies();
  };

  const refetchCategories = async () => {
    await fetchCategories();
  };

  useEffect(() => {
    fetchMovies();
    fetchCategories();
  }, [session, status]);

  return (
    <DataContext.Provider
      value={{
        movies,
        categories,
        isLoading,
        error,
        refetchMovies,
        refetchCategories,
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
