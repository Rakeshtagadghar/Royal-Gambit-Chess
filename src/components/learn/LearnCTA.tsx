'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronRight, Loader2 } from 'lucide-react';

interface LearnCTAProps {
  variant?: 'hero' | 'bottom';
}

export function LearnCTA({ variant = 'hero' }: LearnCTAProps) {
  const { isAuthenticated, isInitialized } = useAuth();
  const t = useTranslations('learn');
  const tCommon = useTranslations('common');

  // Show loading state briefly while checking auth
  if (!isInitialized) {
    return (
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg">
          <Link href="/learn/chess-basics">
            {t('startWithBasics')}
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
        <Button size="lg" variant="outline" disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {tCommon('loading')}
        </Button>
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg">
          <Link href="/learn/chess-basics">
            {t('startWithBasics')}
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
        {isAuthenticated ? (
          <Button asChild size="lg" variant="outline">
            <Link href="/learn/progress">
              {t('viewMyProgress')}
            </Link>
          </Button>
        ) : (
          <Button asChild size="lg" variant="outline">
            <Link href="/login?redirect=/learn">
              {t('signInForLessons')}
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
          {t('startLearningFree')}
          <ChevronRight className="ml-2 h-5 w-5" />
        </Link>
      </Button>
      <Button asChild size="lg" variant="outline">
        <Link href="/chess-guides">{t('browseAllGuides')}</Link>
      </Button>
    </div>
  );
}
