'use client';

import { signOut } from 'next-auth/react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Film, Tv } from 'lucide-react';

interface DashboardNavbarProps {
  contentType: 'movies' | 'series';
  onContentTypeChange: (type: 'movies' | 'series') => void;
}

export function DashboardNavbar({ contentType, onContentTypeChange }: DashboardNavbarProps) {
  const { session } = useAuth();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Site Name */}
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-foreground">What I See</h1>
          </div>

          {/* Content Type Toggle */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={contentType === 'movies' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onContentTypeChange('movies')}
              className="rounded-md px-3 py-1 text-sm"
            >
              <Film className="mr-2 h-4 w-4" />
              Movies
            </Button>
            <Button
              variant={contentType === 'series' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onContentTypeChange('series')}
              className="rounded-md px-3 py-1 text-sm"
            >
              <Tv className="mr-2 h-4 w-4" />
              Series
            </Button>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-4">
            {session?.user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full p-0 overflow-hidden cursor-pointer"
                  >
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="h-full w-full rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 z-[9999] bg-white border border-border shadow-lg" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
