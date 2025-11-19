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
import { Plus } from 'lucide-react';
import { usePanel } from '@/context/PanelContext';

export default function Dashboard() {
  const { movies, categories, isLoading, error, refetchMovies } = useData();
  const { openPanel } = usePanel();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedWatchedStatus, setSelectedWatchedStatus] = useState('all');

  // Filter movies based on search term and selected category
  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      const matchesSearch = searchTerm
        ? movie.title.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      const matchesCategory =
        selectedCategory && selectedCategory !== 'all'
          ? movie.categories.some((categoryTitle: string) => {
              // Find the category by ID and match its name/title
              const category = categories.find(
                (cat: any) => cat._id === selectedCategory
              );
              return category && categoryTitle === category.name;
            })
          : true;

      const matchesWatchedStatus =
        selectedWatchedStatus && selectedWatchedStatus !== 'all'
          ? movie.watchedStatus === selectedWatchedStatus
          : true;

      return matchesSearch && matchesCategory && matchesWatchedStatus;
    });
  }, [movies, searchTerm, selectedCategory, selectedWatchedStatus, categories]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedWatchedStatus('all');
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

          <Button
            size="sm"
            onClick={() => openPanel('add-movie')}
            className="bg-primary text-primary-foreground border-2 border-primary hover:bg-primary/90 hover:border-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Movie
          </Button>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6">
          <SearchAndFilter
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            selectedWatchedStatus={selectedWatchedStatus}
            onSearchChange={setSearchTerm}
            onCategoryChange={setSelectedCategory}
            onWatchedStatusChange={setSelectedWatchedStatus}
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
