import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Film } from 'lucide-react';
import { type MovieData } from '@/app/actions/getAllUserMovies';

interface MovieCardProps {
  movie: MovieData;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Card className="">
      <CardContent className="p-0">
        <div className="aspect-2/3 relative overflow-hidden rounded-t-lg bg-muted">
          {movie.image ? (
            <img
              src={movie.image}
              alt={movie.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Film className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
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
            {movie.title}
          </h3>

          {movie.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {movie.categories.slice(0, 2).map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
              {movie.categories.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{movie.categories.length - 2}
                </Badge>
              )}
            </div>
          )}

          {movie.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {movie.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
              {movie.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{movie.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
