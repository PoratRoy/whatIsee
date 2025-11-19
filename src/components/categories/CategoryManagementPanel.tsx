'use client';

import { useState } from 'react';
import { SlidePanel } from '@/components/ui/slide-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePanel } from '@/context/PanelContext';
import { useData } from '@/context/DataContext';
import { createCategory } from '@/app/actions/createCategory';
import { deleteCategory } from '@/app/actions/deleteCategory';
import { Plus, X, Save, Tag, Trash2 } from 'lucide-react';

export function CategoryManagementPanel() {
  const { isOpen, closePanel } = usePanel();
  const { categories, refetchCategories } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(
    null
  );

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCategoryTitle.trim()) {
      setError('Category title is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await createCategory(newCategoryTitle.trim());

      if (result.success) {
        setNewCategoryTitle('');
        await refetchCategories();
      } else {
        setError(result.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (
    categoryId: string,
    categoryName: string
  ) => {
    if (
      !confirm(
        `Are you sure you want to delete the category "${categoryName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingCategoryId(categoryId);
    setError(null);

    try {
      const result = await deleteCategory(categoryId);

      if (result.success) {
        await refetchCategories();
      } else {
        setError(result.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('An unexpected error occurred');
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const handleClose = () => {
    setNewCategoryTitle('');
    setError(null);
    setDeletingCategoryId(null);
    closePanel();
  };

  return (
    <SlidePanel
      isOpen={isOpen('manage-categories')}
      onClose={handleClose}
      title="Manage Categories"
      size="md"
    >
      <div className="p-6 space-y-6">
        {/* Create New Category */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Add New Category
          </h3>

          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="categoryTitle" className="text-sm font-medium">
                Category Name *
              </label>
              <Input
                id="categoryTitle"
                value={newCategoryTitle}
                onChange={(e) => {
                  setNewCategoryTitle(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter category name"
                maxLength={100}
                disabled={isLoading}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <Button
              type="submit"
              disabled={!newCategoryTitle.trim() || isLoading}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              {isLoading ? 'Creating...' : 'Create Category'}
            </Button>
          </form>
        </div>

        {/* Existing Categories */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Your Categories
            </h3>
            <span className="text-sm text-muted-foreground">
              {categories.length}{' '}
              {categories.length === 1 ? 'category' : 'categories'}
            </span>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No categories yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first category above to organize your movies
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{category.name}</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() =>
                      handleDeleteCategory(category._id, category.name)
                    }
                    disabled={deletingCategoryId === category._id || isLoading}
                    title="Delete category"
                  >
                    {deletingCategoryId === category._id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={isLoading}
          >
            Done
          </Button>
        </div>
      </div>
    </SlidePanel>
  );
}
