import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Film, Plus } from 'lucide-react';

export function EmptyMovieList() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Film className="h-8 w-8 text-muted-foreground" />
          </div>

          <h3 className="text-lg font-semibold mb-2">No movies yet</h3>

          <p className="text-muted-foreground mb-6 text-sm">
            Start building your movie collection by adding your first movie.
          </p>

          <Button className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Movie
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
