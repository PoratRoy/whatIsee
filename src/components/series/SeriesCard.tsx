import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tv, MoreVertical, Trash2 } from 'lucide-react';
import { type SeriesData } from '@/app/actions/getAllUserSeries';
import { useState } from 'react';

interface SeriesCardProps {
  series: SeriesData;
  onSeriesDeleted?: () => void;
}

export function SeriesCard({ series, onSeriesDeleted }: SeriesCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      // TODO: Create deleteSeries action
      console.log('Delete series:', series._id);
      // const result = await deleteSeries(series._id);
      // if (result.success) {
      //   onSeriesDeleted?.();
      // } else {
      //   console.error('Failed to delete series:', result.error);
      // }
    } catch (error) {
      console.error('Error deleting series:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="">
      <CardContent className="p-0">
        <div className="aspect-2/3 relative overflow-hidden rounded-t-lg bg-muted">
          {series.image ? (
            <img
              src={series.image}
              alt={series.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Tv className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          
          {/* Dropdown Menu */}
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border border-border shadow-lg">
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? 'Deleting...' : 'Delete Series'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="p-4">
          <h3
            className="font-semibold text-sm mb-2 min-h-10 overflow-hidden"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {series.title}
          </h3>

          {/* Seasons info */}
          <div className="mb-2">
            <Badge variant="outline" className="text-xs">
              {series.seasons} {series.seasons === 1 ? 'Season' : 'Seasons'}
            </Badge>
          </div>

          {series.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {series.categories.slice(0, 2).map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
              {series.categories.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{series.categories.length - 2}
                </Badge>
              )}
            </div>
          )}

          {series.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {series.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-md font-medium"
                >
                  #{tag}
                </span>
              ))}
              {series.tags.length > 3 && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                  +{series.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
