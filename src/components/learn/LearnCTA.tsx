'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ChevronRight, Loader2 } from 'lucide-react';

interface LearnCTAProps {
  variant?: 'hero' | 'bottom';
}

export function LearnCTA({ variant = 'hero' }: LearnCTAProps) {
  const { isAuthenticated, isInitialized } = useAuth();

  // Show loading state briefly while checking auth
  if (!isInitialized) {
    return (
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg">
          <Link href="/learn/chess-basics">
            Start with Chess Basics
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
        <Button size="lg" variant="outline" disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </Button>
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg">
          <Link href="/learn/chess-basics">
            Start with Chess Basics
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
        {isAuthenticated ? (
          <Button asChild size="lg" variant="outline">
            <Link href="/learn/progress">
              View My Progress
            </Link>
          </Button>
        ) : (
          <Button asChild size="lg" variant="outline">
            <Link href="/login?redirect=/learn">
              Sign In for Interactive Lessons
            </Link>
          </Button>
        )}
      </div>
    );
  }

  // Bottom variant
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button asChild size="lg">
        <Link href="/learn/chess-basics">
          Start Learning Free
          <ChevronRight className="ml-2 h-5 w-5" />
        </Link>
      </Button>
      <Button asChild size="lg" variant="outline">
        <Link href="/chess-guides">Browse All Guides</Link>
      </Button>
    </div>
  );
}
