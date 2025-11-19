'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, X, Plus } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { usePanel } from '@/context/PanelContext';

interface SearchAndFilterProps {
  searchTerm: string;
  selectedCategory: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onClearFilters: () => void;
}

export function SearchAndFilter({
  searchTerm,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
  onClearFilters,
}: SearchAndFilterProps) {
  const { categories } = useData();
  const { openPanel } = usePanel();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const hasActiveFilters =
    searchTerm || (selectedCategory && selectedCategory !== 'all');

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search movies by title..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>

      {/* Filter Section */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
              {[searchTerm, selectedCategory].filter(Boolean).length}
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            Clear all
          </Button>
        )}
      </div>

      {/* Filter Options */}
      {isFilterOpen && (
        <div className="border rounded-lg p-4 bg-card">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">
                  Filter by Category
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openPanel('manage-categories')}
                  className="h-6 px-2 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Manage
                </Button>
              </div>

              {categories.length === 0 ? (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    No categories available
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openPanel('manage-categories')}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Create your first category
                  </Button>
                </div>
              ) : (
                <Select
                  value={selectedCategory}
                  onValueChange={onCategoryChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="pt-2 border-t">
                <p className="text-sm font-medium mb-2">Active Filters:</p>
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs flex items-center gap-1">
                      Search: "{searchTerm}"
                      <button
                        onClick={() => onSearchChange('')}
                        className="hover:bg-secondary-foreground/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedCategory && selectedCategory !== 'all' && (
                    <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs flex items-center gap-1">
                      Category:{' '}
                      {categories.find((c) => c._id === selectedCategory)?.name}
                      <button
                        onClick={() => onCategoryChange('all')}
                        className="hover:bg-secondary-foreground/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
