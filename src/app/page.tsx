'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Always redirect to dashboard - let dashboard handle authentication
    router.replace('/dashboard');
  }, [router]);

  // Return null or a simple loading state since we're redirecting immediately
  return null;
}
