'use client';

import { useState, useEffect } from 'react';
import { usePanel } from '@/context/PanelContext';
import { useData } from '@/context/DataContext';
import { SlidePanel } from '@/components/ui/slide-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Tv, Search } from 'lucide-react';
import { browseSeries, type TMDBSeriesResult } from '@/app/actions/browseSeries';
import { createSeries } from '@/app/actions/createSeries';

export function BrowseSeriesPanel() {
  const { isOpen, closePanel } = usePanel();
  const { categories, series: userSeries, refetchSeries } = useData();
  const [series, setSeries] = useState<TMDBSeriesResult[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingSeriesId, setAddingSeriesId] = useState<number | null>(null);
  const [addedSeriesIds, setAddedSeriesIds] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // Load fresh random series every time panel opens
  useEffect(() => {
    if (isOpen('browse-series')) {
      loadSeries(1, true);
    }
  }, [isOpen('browse-series')]);

  const loadSeries = async (page: number, reset: boolean = false, query?: string) => {
    if (reset) {
      setIsLoading(true);
      setSeries([]);
    } else {
      setIsLoadingMore(true);
    }

    setError(null);
    setCurrentPage(page);

    try {
      const result = await browseSeries(page, query);

      if (result.success && result.series) {
        if (reset) {
          setSeries(result.series);
        } else {
          setSeries(prev => [...prev, ...result.series!]);
        }
        setTotalPages(result.totalPages || 1);
      } else {
        setError(result.error || 'Failed to load series');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error loading series:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMoreSeries = () => {
    if (currentPage < totalPages && !isLoadingMore) {
      const query = searchTerm.trim() || undefined;
      loadSeries(currentPage + 1, false, query);
    }
  };

  // Check if a series is already in the user's list
  const isSeriesAdded = (tmdbId: number) => {
    return addedSeriesIds.has(tmdbId) || userSeries.some(userSerie => 
      userSerie.title.toLowerCase() === series.find(s => s.id === tmdbId)?.name.toLowerCase()
    );
  };

  const handleAddSeries = async (serie: TMDBSeriesResult, categoryId: string) => {
    setAddingSeriesId(serie.id);
    
    try {
      const imageUrl = serie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${serie.poster_path}`
        : undefined;

      // Estimate seasons from TMDB data or default to 1
      const seasons = serie.number_of_seasons || 1;

      const result = await createSeries({
        title: serie.name,
        image: imageUrl,
        categories: categoryId && categoryId !== 'none' ? [categoryId] : [],
        tags: [],
        seasons: seasons,
      });

      if (result.success) {
        // Add to local tracking
        setAddedSeriesIds(prev => new Set([...prev, serie.id]));
        await refetchSeries();
        // Show success feedback (you could add a toast here)
      } else {
        setError(result.error || 'Failed to add series');
      }
    } catch (err) {
      setError('Failed to add series');
    } finally {
      setAddingSeriesId(null);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      // Search for specific series
      loadSeries(1, true, searchTerm.trim());
    } else {
      // Load random series if search is empty
      loadSeries(1, true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <SlidePanel
      isOpen={isOpen('browse-series')}
      onClose={closePanel}
      title="Browse Series"
      size="xl"
    >
      <div className="flex flex-col h-full">
        {/* Header with Search */}
        <div className="shrink-0 px-6 py-4 border-b">
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Search series on TMDB..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSearch} size="default">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {searchTerm ? `Search results for "${searchTerm}"` : 'Discover popular series from TMDB and add them to your collection'}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading series...</span>
            </div>
          ) : series.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Tv className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? `No series found for "${searchTerm}"` : 'No series found'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {series.map((serie) => (
                <SeriesCard
                  key={serie.id}
                  series={serie}
                  categories={categories}
                  onAddSeries={handleAddSeries}
                  isAdding={addingSeriesId === serie.id}
                  isAdded={isSeriesAdded(serie.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Fixed Bottom Section */}
        {!isLoading && series.length > 0 && (
          <div className="shrink-0 border-t bg-background px-6 py-4">
            <div className="flex justify-center">
              {currentPage < totalPages && (
                <Button
                  onClick={loadMoreSeries}
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
                    'Load More Series'
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </SlidePanel>
  );
}

interface SeriesCardProps {
  series: TMDBSeriesResult;
  categories: any[];
  onAddSeries: (series: TMDBSeriesResult, categoryId: string) => void;
  isAdding: boolean;
  isAdded: boolean;
}

function SeriesCard({ series, categories, onAddSeries, isAdding, isAdded }: SeriesCardProps) {
  const [selectedCategory, setSelectedCategory] = useState('none');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = () => {
    onAddSeries(series, selectedCategory);
    setShowAddForm(false);
    setSelectedCategory('none');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.getFullYear().toString();
  };

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow duration-200 ${isAdded ? 'bg-green-50 border-green-200' : ''}`}>
      <CardContent className="p-0">
        {/* Series Poster */}
        <div className="aspect-2/3 relative overflow-hidden bg-muted">
          {series.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${series.poster_path}`}
              alt={series.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Tv className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="p-3">
          {/* Title */}
          <h3
            className="font-semibold text-sm mb-2 min-h-10 overflow-hidden"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {series.name}
          </h3>

          {/* Year and Rating */}
          <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
            {series.first_air_date && (
              <span>{formatDate(series.first_air_date)}</span>
            )}
            {series.vote_average > 0 && (
              <>
                <span>•</span>
                <span>⭐ {series.vote_average.toFixed(1)}</span>
              </>
            )}
          </div>

          {/* Add Series Section */}
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
