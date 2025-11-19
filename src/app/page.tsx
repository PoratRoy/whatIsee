'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Film, Tv, LogOut, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { session, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">whatIsee</h1>
          <nav>
            {status === 'loading' ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-muted-foreground">Loading...</span>
              </div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <span className="text-muted-foreground">
                  Welcome, {session.user?.name}
                </span>
                <Button onClick={handleSignOut} variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Button asChild variant="ghost">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">whatIsee</h1>
          <p className="text-xl text-muted-foreground">
            Your personal movie gallery to track and share what you watch
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              {session ? (
                <>
                  <CardTitle className="text-center">
                    Welcome back, {session.user?.name}!
                  </CardTitle>
                  <CardDescription className="text-center">
                    Ready to add some new movies to your collection?
                  </CardDescription>
                </>
              ) : (
                <>
                  <CardTitle className="text-center">
                    Welcome to whatIsee
                  </CardTitle>
                  <CardDescription className="text-center">
                    Start building your movie collection and share your viewing
                    experiences with friends.
                  </CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent>
              {session ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="flex-1">
                    <Film className="mr-2 h-4 w-4" />
                    Add Movie
                  </Button>
                  <Button variant="secondary" className="flex-1">
                    <Tv className="mr-2 h-4 w-4" />
                    Add Series
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild className="flex-1">
                    <Link href="/auth/signup">Get Started</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/auth/signin">Sign In</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
