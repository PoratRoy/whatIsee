'use client';

import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Loader2, X, Plus } from 'lucide-react';
import { createSeries, type CreateSeriesData } from '@/app/actions/createSeries';

interface FormData {
  title: string;
  image: string;
  category: string;
  tags: string[];
  seasons: number;
}

export function AddSeriesPanel() {
  const { isOpen, closePanel } = usePanel();
  const { categories, refetchSeries } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState<FormData>({
    title: '',
    image: '',
    category: 'none',
    tags: [],
    seasons: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Series title is required');
      return;
    }

    if (formData.seasons < 1 || formData.seasons > 100) {
      setError('Number of seasons must be between 1 and 100');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const seriesData: CreateSeriesData = {
        title: formData.title.trim(),
        image: formData.image || undefined,
        categories: formData.category && formData.category !== 'none' ? [formData.category] : [],
        tags: formData.tags,
        seasons: formData.seasons,
      };

      const result = await createSeries(seriesData);

      if (result.success) {
        // Reset form and close panel
        setFormData({
          title: '',
          image: '',
          category: 'none',
          tags: [],
          seasons: 1,
        });

        // Refresh the series list
        await refetchSeries();
        closePanel();
      } else {
        setError(result.error || 'Failed to create series');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error creating series:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <SlidePanel
      isOpen={isOpen('add-series')}
      onClose={closePanel}
      title="Add New Series"
      size="lg"
    >
      <div className="flex flex-col h-full">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Series Title *</label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter series title"
                disabled={isSubmitting}
                className="w-full"
              />
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <label htmlFor="image" className="text-sm font-medium">Image URL</label>
              <Input
                id="image"
                type="url"
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                disabled={isSubmitting}
                className="w-full"
              />
            </div>

            {/* Seasons */}
            <div className="space-y-2">
              <label htmlFor="seasons" className="text-sm font-medium">Number of Seasons *</label>
              <Input
                id="seasons"
                type="number"
                min="1"
                max="100"
                value={formData.seasons}
                onChange={(e) => setFormData(prev => ({ ...prev, seasons: parseInt(e.target.value) || 1 }))}
                disabled={isSubmitting}
                className="w-full"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">Category</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full cursor-pointer">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-border shadow-lg">
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label htmlFor="tags" className="text-sm font-medium">Tags</label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter a tag"
                  disabled={isSubmitting}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || isSubmitting}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        disabled={isSubmitting}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="shrink-0 border-t bg-background px-6 py-4">
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={closePanel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.title.trim()}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Series'
              )}
            </Button>
          </div>
        </div>
      </div>
    </SlidePanel>
  );
}
