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
import { Plus, X, Save, Image as ImageIcon } from 'lucide-react';

interface MovieFormData {
  title: string;
  image: string;
  categories: string[];
  tags: string[];
}

export function AddMoviePanel() {
  const { isOpen, closePanel } = usePanel();
  const { categories } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [newTag, setNewTag] = useState('');

  const [formData, setFormData] = useState<MovieFormData>({
    title: '',
    image: '',
    categories: [],
    tags: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement movie creation API call
      console.log('Creating movie:', formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset form and close panel
      setFormData({
        title: '',
        image: '',
        categories: [],
        tags: [],
      });
      closePanel();
    } catch (error) {
      console.error('Error creating movie:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
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
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  return (
    <SlidePanel
      isOpen={isOpen('add-movie')}
      onClose={closePanel}
      title="Add New Movie"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Movie Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Movie Title *
          </label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Enter movie title"
            required
          />
        </div>

        {/* Movie Image */}
        <div className="space-y-2">
          <label htmlFor="image" className="text-sm font-medium">
            Image URL
          </label>
          <div className="space-y-2">
            <Input
              id="image"
              value={formData.image}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, image: e.target.value }))
              }
              placeholder="https://example.com/movie-poster.jpg"
              type="url"
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
        <div className="space-y-2">
          <label className="text-sm font-medium">Categories</label>
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category._id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.categories.includes(category._id)}
                  onChange={() => handleCategoryChange(category._id)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{category.name}</span>
              </label>
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No categories available. Create some categories first.
              </p>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tags</label>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddTag}
              disabled={!newTag.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-secondary-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="submit"
            disabled={!formData.title.trim() || isLoading}
            className="flex-1"
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Creating...' : 'Create Movie'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={closePanel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </SlidePanel>
  );
}
