'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { MovieCard } from '@/components/movies/MovieCard';
import { SeriesCard } from '@/components/series/SeriesCard';
import { MovieGridSkeleton } from '@/components/movies/MovieGridSkeleton';
import { EmptyMovieList } from '@/components/movies/EmptyMovieList';
import { DashboardNavbar } from '@/components/dashboard/DashboardNavbar';
import { SearchAndFilter } from '@/components/dashboard/SearchAndFilter';
import { AddMoviePanel } from '@/components/movies/AddMoviePanel';
import { AddSeriesPanel } from '@/components/series/AddSeriesPanel';
import { BrowseMoviesPanel } from '@/components/movies/BrowseMoviesPanel';
import { BrowseSeriesPanel } from '@/components/series/BrowseSeriesPanel';
import { CategoryManagementPanel } from '@/components/categories/CategoryManagementPanel';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { usePanel } from '@/context/PanelContext';

export default function Dashboard() {
  const { session, status } = useAuth();
  const router = useRouter();
  const {
    movies,
    series,
    categories,
    tags,
    isLoading,
    error,
    refetchMovies,
    refetchSeries,
  } = useData();
  const { openPanel } = usePanel();
  const [contentType, setContentType] = useState<'movies' | 'series'>('movies');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedWatchedStatus, setSelectedWatchedStatus] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Tag handlers
  const handleTagAdd = (tagId: string) => {
    if (!selectedTags.includes(tagId)) {
      setSelectedTags(prev => [...prev, tagId]);
    }
  };

  const handleTagRemove = (tagId: string) => {
    setSelectedTags(prev => prev.filter(id => id !== tagId));
  };

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

      const matchesTags =
        selectedTags.length > 0
          ? selectedTags.every(tagId =>
              movie.tags.some(movieTag => movieTag._id === tagId)
            )
          : true;

      return matchesSearch && matchesCategory && matchesWatchedStatus && matchesTags;
    });
  }, [movies, searchTerm, selectedCategory, selectedWatchedStatus, selectedTags, categories]);

  // Filter series based on search term and selected category
  const filteredSeries = useMemo(() => {
    return series.filter((serie) => {
      const matchesSearch = searchTerm
        ? serie.title.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      const matchesCategory =
        selectedCategory && selectedCategory !== 'all'
          ? serie.categories.some((categoryTitle: string) => {
              // Find the category by ID and match its name/title
              const category = categories.find(
                (cat: any) => cat._id === selectedCategory
              );
              return category && categoryTitle === category.name;
            })
          : true;

      return matchesSearch && matchesCategory;
    });
  }, [series, searchTerm, selectedCategory, categories]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedWatchedStatus('all');
    setSelectedTags([]);
  };

  // Redirect unauthenticated users to sign-in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin');
    }
  }, [status, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return <MovieGridSkeleton />;
  }

  // Don't render anything if redirecting to sign-in
  if (status === 'unauthenticated') {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar
          contentType={contentType}
          onContentTypeChange={setContentType}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-foreground">
              {contentType === 'movies' ? 'My Movies' : 'My Series'}
            </h1>
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
      <DashboardNavbar
        contentType={contentType}
        onContentTypeChange={setContentType}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {contentType === 'movies' ? 'My Movies' : 'My Series'}
            </h1>
            {!isLoading && (
              <p className="text-muted-foreground mt-1">
                {contentType === 'movies'
                  ? `${filteredMovies.length} of ${movies.length} ${movies.length === 1 ? 'movie' : 'movies'} shown`
                  : `${filteredSeries.length} of ${series.length} ${series.length === 1 ? 'series' : 'series'} shown`}
              </p>
            )}
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              size="sm"
              onClick={() =>
                openPanel(
                  contentType === 'movies' ? 'browse-movies' : 'browse-series'
                )
              }
              variant="outline"
              className="flex-1 sm:flex-none border-2 hover:border-primary hover:bg-primary/5 transition-all duration-200"
            >
              <Search className="mr-2 h-4 w-4" />
              {contentType === 'movies' ? 'Browse Movies' : 'Browse Series'}
            </Button>
            <Button
              size="sm"
              onClick={() =>
                openPanel(contentType === 'movies' ? 'add-movie' : 'add-series')
              }
              className="flex-1 sm:flex-none bg-primary text-primary-foreground border-2 border-primary hover:bg-primary/90 hover:border-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="mr-2 h-4 w-4" />
              {contentType === 'movies' ? 'Add Movie' : 'Add Series'}
            </Button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6">
          <SearchAndFilter
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            selectedWatchedStatus={selectedWatchedStatus}
            selectedTags={selectedTags}
            onSearchChange={setSearchTerm}
            onCategoryChange={setSelectedCategory}
            onWatchedStatusChange={setSelectedWatchedStatus}
            onTagAdd={handleTagAdd}
            onTagRemove={handleTagRemove}
            onClearFilters={handleClearFilters}
          />
        </div>

        {isLoading ? (
          <MovieGridSkeleton />
        ) : contentType === 'movies' ? (
          movies.length === 0 ? (
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
                <MovieCard
                  key={movie._id}
                  movie={movie}
                  onMovieDeleted={refetchMovies}
                />
              ))}
            </div>
          )
        ) : series.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                No series found. Start by adding your first series!
              </p>
            </div>
          </div>
        ) : filteredSeries.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                No series match your current filters
              </p>
              <Button onClick={handleClearFilters} variant="outline">
                Clear Filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredSeries.map((serie) => (
              <SeriesCard
                key={serie._id}
                series={serie}
                onSeriesDeleted={refetchSeries}
              />
            ))}
          </div>
        )}
      </div>

      {/* Slide Panels */}
      <AddMoviePanel />
      <AddSeriesPanel />
      <BrowseMoviesPanel />
      <BrowseSeriesPanel />
      <CategoryManagementPanel />
    </div>
  );
}
