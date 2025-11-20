'use client';

import { useState } from 'react';
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
import { usePanel } from '@/context/PanelContext';
import { useData } from '@/context/DataContext';
import { createMovie } from '@/app/actions/createMovie';
import { createTag } from '@/app/actions/createTag';
import { Plus, X, Save, Image as ImageIcon, Search, Tag as TagIcon } from 'lucide-react';

interface MovieFormData {
  title: string;
  image: string;
  category: string;
  tags: string[];
  watchedStatus: 'watched' | 'to_watch';
}

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  imageUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string;
  rating: number;
  genreIds: number[];
}

export function AddMoviePanel() {
  const { isOpen, closePanel } = usePanel();
  const { categories, tags, refetchMovies, refetchTags } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [selectedTagValue, setSelectedTagValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<MovieFormData>({
    title: '',
    image: '',
    category: 'none',
    tags: [],
    watchedStatus: 'watched',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await createMovie({
        title: formData.title,
        image: formData.image || undefined,
        categories: formData.category && formData.category !== 'none' ? [formData.category] : [],
        tags: formData.tags,
        watchedStatus: formData.watchedStatus,
      });

      if (result.success) {
        // Reset form and close panel
        setFormData({
          title: '',
          image: '',
          category: 'none',
          tags: [],
          watchedStatus: 'watched',
        });
        setShowSearchResults(false);
        setSearchResults([]);

        // Refresh the movies list
        await refetchMovies();

        closePanel();
      } else {
        setError(result.error || 'Failed to create movie');
      }
    } catch (error) {
      console.error('Error creating movie:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = (tagId: string) => {
    if (tagId && tagId !== 'none' && !formData.tags.includes(tagId)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagId],
      }));
    }
    // Clear the select value after selection
    setSelectedTagValue('');
  };

  const handleCreateTag = async () => {
    if (!newTag.trim()) return;

    setIsCreatingTag(true);
    try {
      const result = await createTag({
        name: newTag.trim(),
      });

      if (result.success && result.tag) {
        // Add the new tag to the form
        handleAddTag(result.tag._id);
        // Refresh tags list
        await refetchTags();
        // Reset form
        setNewTag('');
        setShowCreateTag(false);
      } else {
        setError(result.error || 'Failed to create tag');
      }
    } catch (err) {
      setError('Failed to create tag');
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      category: categoryId,
    }));
  };

  const handleSearchTMDB = async () => {
    if (!formData.title.trim()) {
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/tmdb?query=${encodeURIComponent(formData.title)}`
      );
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.movies);
        setShowSearchResults(true);
      } else {
        console.error('TMDB search error:', data.error);
      }
    } catch (error) {
      console.error('Error searching TMDB:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectMovie = (movie: TMDBMovie) => {
    setFormData((prev) => ({
      ...prev,
      title: movie.title,
      image: movie.imageUrl || '',
    }));
    setShowSearchResults(false);
  };

  const handleClose = () => {
    setFormData({
      title: '',
      image: '',
      category: 'none',
      tags: [],
      watchedStatus: 'watched',
    });
    setNewTag('');
    setShowCreateTag(false);
    setIsCreatingTag(false);
    setSelectedTagValue('');
    setError(null);
    setShowSearchResults(false);
    setSearchResults([]);
    closePanel();
  };

  return (
    <SlidePanel
      isOpen={isOpen('add-movie')}
      onClose={handleClose}
      title="Add New Movie"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Movie Title */}
        <div className="space-y-3">
          <label
            htmlFor="title"
            className="text-sm font-semibold text-foreground"
          >
            Movie Title *
          </label>
          <div className="flex gap-3">
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter movie title"
              required
              className="flex-1 h-11 px-4 text-base border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            />
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleSearchTMDB}
              disabled={!formData.title.trim() || isSearching}
              className="h-11 px-4 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-200"
            >
              {isSearching ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          {error && (
            <p className="text-sm text-destructive font-medium bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </p>
          )}
        </div>

        {/* TMDB Search Results */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground">
                Search Results from TMDB
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowSearchResults(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2 border-2 border-border rounded-xl p-4 bg-muted/30">
              {searchResults.map((movie) => (
                <div
                  key={movie.id}
                  className="flex items-center gap-4 p-3 hover:bg-white hover:shadow-md rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-border"
                  onClick={() => handleSelectMovie(movie)}
                >
                  {movie.imageUrl ? (
                    <img
                      src={movie.imageUrl}
                      alt={movie.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{movie.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {movie.releaseDate
                        ? new Date(movie.releaseDate).getFullYear()
                        : 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {movie.overview}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ⭐ {movie.rating.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowSearchResults(false)}
              className="w-full"
            >
              Hide Results
            </Button>
          </div>
        )}

        {/* Movie Image */}
        <div className="space-y-3">
          <label
            htmlFor="image"
            className="text-sm font-semibold text-foreground"
          >
            Movie Poster URL
          </label>
          <div className="space-y-4">
            <Input
              id="image"
              value={formData.image}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, image: e.target.value }))
              }
              placeholder="https://example.com/movie-poster.jpg"
              type="url"
              className="h-11 px-4 text-base border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            />
            {formData.image && (
              <div className="relative w-32 h-48 border rounded-lg overflow-hidden bg-muted">
                <img
                  src={formData.image}
                  alt="Movie preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground">
            Category
          </label>
          {categories.length === 0 ? (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                No categories available. Create some categories first.
              </p>
            </div>
          ) : (
            <Select
              value={formData.category}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="h-11 px-4 text-base border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200">
                <SelectValue placeholder="Select a category (optional)" />
              </SelectTrigger>
              <SelectContent className="z-9999 bg-white border border-border shadow-lg">
                <SelectItem value="none">No category</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Watched Status */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground">
            Watched Status
          </label>
          <Select
            value={formData.watchedStatus}
            onValueChange={(value: 'watched' | 'to_watch') =>
              setFormData((prev) => ({ ...prev, watchedStatus: value }))
            }
          >
            <SelectTrigger className="h-11 px-4 text-base border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200">
              <SelectValue placeholder="Select watched status" />
            </SelectTrigger>
            <SelectContent className="z-9999 bg-white border border-border shadow-lg">
              <SelectItem value="watched">Watched</SelectItem>
              <SelectItem value="to_watch">To Watch</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground">Tags</label>
          
          {/* Tag Selection */}
          <div className="space-y-3">
            <Select value={selectedTagValue} onValueChange={handleAddTag}>
              <SelectTrigger className="h-11 px-4 text-base border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200">
                <SelectValue placeholder="Select a tag to add" />
              </SelectTrigger>
              <SelectContent className="z-9999 bg-white border border-border shadow-lg">
                <SelectItem value="none">No tags</SelectItem>
                {tags.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No tags available
                  </div>
                ) : (
                  tags
                    .filter(tag => !formData.tags.includes(tag._id))
                    .map((tag) => (
                      <SelectItem key={tag._id} value={tag._id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: tag.color }}
                          />
                          {tag.name}
                        </div>
                      </SelectItem>
                    ))
                )}
              </SelectContent>
            </Select>

            {/* Create New Tag */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCreateTag(!showCreateTag)}
                className="flex items-center gap-2"
              >
                <TagIcon className="h-4 w-4" />
                {showCreateTag ? 'Cancel' : 'Create New Tag'}
              </Button>
            </div>

            {showCreateTag && (
              <div className="space-y-3 p-4 border-2 border-dashed border-border rounded-lg bg-muted/10">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Enter tag name"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateTag();
                      }
                    }}
                    className="flex-1 h-10"
                  />
                  <Button
                    type="button"
                    onClick={handleCreateTag}
                    disabled={!newTag.trim() || isCreatingTag}
                    size="sm"
                    className="h-10"
                  >
                    {isCreatingTag ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Selected Tags */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 border-2 border-border rounded-xl bg-muted/20">
              {formData.tags.map((tagId) => {
                const tag = tags.find(t => t._id === tagId);
                return (
                  <span
                    key={tagId}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-medium"
                  >
                    {tag && (
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: tag.color }}
                      />
                    )}
                    {tag ? tag.name : 'Unknown Tag'}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tagId)}
                      className="hover:bg-primary/20 rounded-full p-1 transition-colors duration-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        </div>

        {/* Fixed Actions Section */}
        <div className="shrink-0 p-6 border-t-2 border-border bg-background">
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleClose}
              disabled={isLoading}
              className="h-12 px-6 text-base font-medium border-2 hover:border-primary hover:bg-primary/5 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.title.trim() || isLoading}
              size="lg"
              className="flex-1 h-12 text-base font-semibold bg-primary hover:bg-primary/90 border-2 border-primary transition-all duration-200"
            >
              <Save className="mr-2 h-5 w-5" />
              {isLoading ? 'Creating...' : 'Create Movie'}
            </Button>
          </div>
        </div>
      </form>
    </SlidePanel>
  );
}
