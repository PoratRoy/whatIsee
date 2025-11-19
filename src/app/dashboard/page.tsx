'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { MovieCard } from '@/components/movies/MovieCard';
import { MovieGridSkeleton } from '@/components/movies/MovieGridSkeleton';
import { EmptyMovieList } from '@/components/movies/EmptyMovieList';
import { DashboardNavbar } from '@/components/dashboard/DashboardNavbar';
import { SearchAndFilter } from '@/components/dashboard/SearchAndFilter';
import { AddMoviePanel } from '@/components/movies/AddMoviePanel';
import { CategoryManagementPanel } from '@/components/categories/CategoryManagementPanel';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus } from 'lucide-react';
import { usePanel } from '@/context/PanelContext';

export default function Dashboard() {
  const { movies, isLoading, error, refetchMovies } = useData();
  const { openPanel } = usePanel();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Filter movies based on search term and selected category
  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      const matchesSearch = searchTerm
        ? movie.title.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      const matchesCategory =
        selectedCategory && selectedCategory !== 'all'
          ? movie.categories.includes(selectedCategory)
          : true;

      return matchesSearch && matchesCategory;
    });
  }, [movies, searchTerm, selectedCategory]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-foreground">My Movies</h1>
          </div>

          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={refetchMovies} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Movies</h1>
            {!isLoading && (
              <p className="text-muted-foreground mt-1">
                {filteredMovies.length} of {movies.length}{' '}
                {movies.length === 1 ? 'movie' : 'movies'} shown
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={refetchMovies}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
            <Button size="sm" onClick={() => openPanel('add-movie')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Movie
            </Button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6">
          <SearchAndFilter
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            onSearchChange={setSearchTerm}
            onCategoryChange={setSelectedCategory}
            onClearFilters={handleClearFilters}
          />
        </div>

        {isLoading ? (
          <MovieGridSkeleton />
        ) : movies.length === 0 ? (
          <EmptyMovieList />
        ) : filteredMovies.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                No movies match your current filters
              </p>
              <Button onClick={handleClearFilters} variant="outline">
                Clear Filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        )}
      </div>

      {/* Slide Panels */}
      <AddMoviePanel />
      <CategoryManagementPanel />
    </div>
  );
}
