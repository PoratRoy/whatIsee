'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { session, status } = useAuth();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            whatIsee
          </h1>
          <nav>
            {status === 'loading' ? (
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-20 rounded"></div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 dark:text-gray-300">
                  Welcome, {session.user?.name}
                </span>
                <button
                  onClick={handleSignOut}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/auth/signin"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            whatIsee
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Your personal movie gallery to track and share what you watch
          </p>
        </div>

        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            {session ? (
              <>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Welcome back, {session.user?.name}!
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Ready to add some new movies to your collection?
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors">
                    Add Movie
                  </button>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md transition-colors">
                    Add Series
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Welcome to whatIsee
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Start building your movie collection and share your viewing
                  experiences with friends.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/auth/signup"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors inline-block"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 px-6 py-3 rounded-md transition-colors inline-block"
                  >
                    Sign In
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
