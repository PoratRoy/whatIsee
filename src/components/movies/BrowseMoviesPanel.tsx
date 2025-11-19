'use client';

import { useState, useEffect } from 'react';
import { SlidePanel } from '@/components/ui/slide-panel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePanel } from '@/context/PanelContext';
import { useData } from '@/context/DataContext';
import { browseMovies, type TMDBMovieResult } from '@/app/actions/browseMovies';
import { createMovie } from '@/app/actions/createMovie';
import { Film, Star, Calendar, Plus, Loader2 } from 'lucide-react';

export function BrowseMoviesPanel() {
  const { isOpen, closePanel } = usePanel();
  const { categories, movies: userMovies, refetchMovies } = useData();
  const [movies, setMovies] = useState<TMDBMovieResult[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingMovieId, setAddingMovieId] = useState<number | null>(null);
  const [addedMovieIds, setAddedMovieIds] = useState<Set<number>>(new Set());

  // Load fresh random movies every time panel opens
  useEffect(() => {
    if (isOpen('browse-movies')) {
      loadMovies(1, true);
    }
  }, [isOpen('browse-movies')]);

  const loadMovies = async (page: number, reset: boolean = false) => {
    if (reset) {
      setIsLoading(true);
      setMovies([]);
    } else {
      setIsLoadingMore(true);
    }
    
    setError(null);

    try {
      const result = await browseMovies(page);
      
      if (result.success && result.movies) {
        setMovies(prev => reset ? result.movies! : [...prev, ...result.movies!]);
        setCurrentPage(result.currentPage || page);
        setTotalPages(result.totalPages || 1);
      } else {
        setError(result.error || 'Failed to load movies');
      }
    } catch (err) {
      setError('Failed to load movies');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !isLoadingMore) {
      loadMovies(currentPage + 1, false);
    }
  };

  // Check if a movie is already in the user's list
  const isMovieAdded = (tmdbId: number) => {
    return addedMovieIds.has(tmdbId) || userMovies.some(userMovie => 
      userMovie.title.toLowerCase() === movies.find(m => m.id === tmdbId)?.title.toLowerCase()
    );
  };

  const handleAddMovie = async (movie: TMDBMovieResult, categoryId: string, watchedStatus: 'watched' | 'to_watch') => {
    setAddingMovieId(movie.id);
    
    try {
      const imageUrl = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : undefined;

      const result = await createMovie({
        title: movie.title,
        image: imageUrl,
        categories: categoryId && categoryId !== 'none' ? [categoryId] : [],
        tags: [],
        watchedStatus,
      });

      if (result.success) {
        // Add to local tracking
        setAddedMovieIds(prev => new Set([...prev, movie.id]));
        await refetchMovies();
        // Show success feedback (you could add a toast here)
      } else {
        setError(result.error || 'Failed to add movie');
      }
    } catch (err) {
      setError('Failed to add movie');
    } finally {
      setAddingMovieId(null);
    }
  };

  const handleClose = () => {
    setMovies([]);
    setCurrentPage(1);
    setTotalPages(1);
    setError(null);
    closePanel();
  };

  return (
    <SlidePanel
      isOpen={isOpen('browse-movies')}
      onClose={handleClose}
      title="Browse Movies"
      size="xl"
    >
      <div className="flex flex-col h-full">
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading movies...</span>
            </div>
          ) : (
            <>
              {/* Movies Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                {movies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    categories={categories}
                    onAddMovie={handleAddMovie}
                    isAdding={addingMovieId === movie.id}
                    isAdded={isMovieAdded(movie.id)}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {currentPage < totalPages && (
                <div className="flex justify-center">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    variant="outline"
                    size="lg"
                    className="h-12 px-8"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More Movies'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </SlidePanel>
  );
}

interface MovieCardProps {
  movie: TMDBMovieResult;
  categories: any[];
  onAddMovie: (movie: TMDBMovieResult, categoryId: string, watchedStatus: 'watched' | 'to_watch') => void;
  isAdding: boolean;
  isAdded: boolean;
}

function MovieCard({ movie, categories, onAddMovie, isAdding, isAdded }: MovieCardProps) {
  const [selectedCategory, setSelectedCategory] = useState('none');
  const [selectedWatchedStatus, setSelectedWatchedStatus] = useState<'watched' | 'to_watch'>('watched');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = () => {
    onAddMovie(movie, selectedCategory, selectedWatchedStatus);
    setShowAddForm(false);
    setSelectedCategory('none');
    setSelectedWatchedStatus('watched');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.getFullYear().toString();
  };

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow duration-200 ${isAdded ? 'bg-green-50 border-green-200' : ''}`}>
      <CardContent className="p-0">
        {/* Movie Poster */}
        <div className="aspect-2/3 relative overflow-hidden bg-muted">
          {movie.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Film className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Movie Info */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">
              {movie.title}
            </h3>
            
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              {movie.release_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(movie.release_date)}
                </div>
              )}
              {movie.vote_average > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {movie.vote_average.toFixed(1)}
                </div>
              )}
            </div>
          </div>

          {movie.overview && (
            <p className="text-xs text-muted-foreground line-clamp-3">
              {movie.overview}
            </p>
          )}

          {/* Add Movie Section */}
          {isAdded ? (
            <Button
              disabled
              size="sm"
              className="w-full h-8 text-xs bg-green-100 text-green-700 border-green-200 cursor-not-allowed"
              variant="outline"
            >
              ✓ Added
            </Button>
          ) : !showAddForm ? (
            <Button
              onClick={() => setShowAddForm(true)}
              size="sm"
              className="w-full h-8 text-xs"
              variant="outline"
            >
              <Plus className="mr-1 h-3 w-3" />
              Add to My List
            </Button>
          ) : (
            <div className="space-y-2">
              {/* Category Select */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="z-[10000] bg-white border border-border shadow-lg">
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Watched Status Select */}
              <Select value={selectedWatchedStatus} onValueChange={(value: 'watched' | 'to_watch') => setSelectedWatchedStatus(value)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[10000] bg-white border border-border shadow-lg">
                  <SelectItem value="watched">Watched</SelectItem>
                  <SelectItem value="to_watch">To Watch</SelectItem>
                </SelectContent>
              </Select>

              {/* Action Button */}
              <Button
                onClick={handleAdd}
                disabled={isAdding}
                size="sm"
                className="w-full h-7 text-xs"
              >
                {isAdding ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  'Add'
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
