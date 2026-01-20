'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CachedAvatarImage } from '@/components/ui/cached-avatar-image';
import { XCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import type { PlayerAnalysisSummary } from '@/types/chess';

interface ReviewPlayerCardProps {
  color: 'white' | 'black';
  username: string;
  displayName?: string;
  avatarUrl?: string;
  rating?: number;
  ratingDelta?: number;
  analysis?: PlayerAnalysisSummary;
  className?: string;
}

function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 90) return 'text-green-500';
  if (accuracy >= 75) return 'text-blue-500';
  if (accuracy >= 60) return 'text-yellow-500';
  return 'text-red-500';
}

function getAccuracyBg(accuracy: number): string {
  if (accuracy >= 90) return 'bg-green-500/10';
  if (accuracy >= 75) return 'bg-blue-500/10';
  if (accuracy >= 60) return 'bg-yellow-500/10';
  return 'bg-red-500/10';
}

export function ReviewPlayerCard({
  color,
  username,
  displayName,
  avatarUrl,
  rating,
  ratingDelta,
  analysis,
  className,
}: ReviewPlayerCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col p-3 sm:p-4 rounded-lg bg-card border',
        color === 'white' ? 'border-gray-200 dark:border-gray-700' : 'border-gray-700',
        className
      )}
    >
      {/* Player info */}
      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
        <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
          <CachedAvatarImage src={avatarUrl} alt={username} />
          <AvatarFallback
            className={cn(
              'text-xs sm:text-sm font-bold',
              color === 'white' ? 'bg-gray-100 text-gray-900' : 'bg-gray-900 text-gray-100'
            )}
          >
            {username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-sm sm:text-base font-semibold truncate">{displayName || username}</span>
            <div
              className={cn(
                'w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0',
                color === 'white' ? 'bg-gray-100 border border-gray-300' : 'bg-gray-900'
              )}
            />
          </div>
          {rating !== undefined && (
            <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
              <span>{rating}</span>
              {ratingDelta !== undefined && ratingDelta !== 0 && (
                <span className={cn(ratingDelta > 0 ? 'text-green-500' : 'text-red-500')}>
                  ({ratingDelta > 0 ? '+' : ''}
                  {ratingDelta})
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Analysis stats */}
      {analysis && (
        <>
          {/* Accuracy */}
          <div
            className={cn(
              'flex items-center justify-center py-2 sm:py-3 rounded-lg mb-2 sm:mb-3',
              getAccuracyBg(analysis.accuracy)
            )}
          >
            <span className={cn('text-2xl sm:text-3xl font-bold', getAccuracyColor(analysis.accuracy))}>
              {analysis.accuracy.toFixed(1)}%
            </span>
          </div>

          {/* Error counts */}
          <div className="flex items-center justify-between text-xs sm:text-sm gap-0.5 sm:gap-1">
            <div className="flex items-center gap-0.5 sm:gap-1 min-w-0">
              <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">B</span>
              <span className="font-medium text-[11px] sm:text-sm">{analysis.blunders}</span>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1 min-w-0">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">M</span>
              <span className="font-medium text-[11px] sm:text-sm">{analysis.mistakes}</span>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1 min-w-0">
              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">I</span>
              <span className="font-medium text-[11px] sm:text-sm">{analysis.inaccuracies}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
