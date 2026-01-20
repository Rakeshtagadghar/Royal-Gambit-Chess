'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Play,
  Pause,
  FlipVertical,
} from 'lucide-react';

interface ReviewNavigationProps {
  currentPly: number;
  totalPlies: number;
  onPlyChange: (ply: number) => void;
  onFlipBoard?: () => void;
  className?: string;
}

export function ReviewNavigation({
  currentPly,
  totalPlies,
  onPlyChange,
  onFlipBoard,
  className,
}: ReviewNavigationProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1); // seconds per move

  // Navigation handlers
  const goToStart = useCallback(() => {
    onPlyChange(0);
    setIsPlaying(false);
  }, [onPlyChange]);

  const goToPrevious = useCallback(() => {
    if (currentPly > 0) {
      onPlyChange(currentPly - 1);
    }
  }, [currentPly, onPlyChange]);

  const goToNext = useCallback(() => {
    if (currentPly < totalPlies) {
      onPlyChange(currentPly + 1);
    }
  }, [currentPly, totalPlies, onPlyChange]);

  const goToEnd = useCallback(() => {
    onPlyChange(totalPlies);
    setIsPlaying(false);
  }, [totalPlies, onPlyChange]);

  const togglePlay = useCallback(() => {
    if (currentPly >= totalPlies) {
      // If at the end, restart from beginning
      onPlyChange(0);
    }
    setIsPlaying((prev) => !prev);
  }, [currentPly, totalPlies, onPlyChange]);

  // Auto-play effect
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (currentPly >= totalPlies) {
        setIsPlaying(false);
        return;
      }
      onPlyChange(currentPly + 1);
    }, playSpeed * 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentPly, totalPlies, playSpeed, onPlyChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case 'Home':
          e.preventDefault();
          goToStart();
          break;
        case 'End':
          e.preventDefault();
          goToEnd();
          break;
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          onFlipBoard?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToStart, goToPrevious, goToNext, goToEnd, togglePlay, onFlipBoard]);

  // Speed options
  const speedOptions = [
    { value: 2, label: '0.5x' },
    { value: 1, label: '1x' },
    { value: 0.5, label: '2x' },
    { value: 0.33, label: '3x' },
  ];

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3', className)}>
      {/* Main navigation controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Start */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9"
          onClick={goToStart}
          disabled={currentPly === 0}
          title="First move (Home)"
        >
          <ChevronsLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        {/* Previous */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9"
          onClick={goToPrevious}
          disabled={currentPly === 0}
          title="Previous move (Left arrow)"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        {/* Play/Pause */}
        <Button
          variant={isPlaying ? 'default' : 'ghost'}
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9"
          onClick={togglePlay}
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
          ) : (
            <Play className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
        </Button>

        {/* Next */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9"
          onClick={goToNext}
          disabled={currentPly >= totalPlies}
          title="Next move (Right arrow)"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        {/* End */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9"
          onClick={goToEnd}
          disabled={currentPly >= totalPlies}
          title="Last move (End)"
        >
          <ChevronsRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        {/* Move counter */}
        <span className="text-xs sm:text-sm text-muted-foreground ml-1 sm:ml-2 tabular-nums min-w-[60px] text-center">
          {currentPly} / {totalPlies}
        </span>
      </div>

      {/* Secondary controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Separator (hidden on mobile) */}
        <div className="hidden sm:block w-px h-6 bg-border" />

        {/* Speed selector */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {speedOptions.map((option) => (
            <Button
              key={option.value}
              variant={playSpeed === option.value ? 'secondary' : 'ghost'}
              size="sm"
              className="h-6 px-1.5 sm:h-7 sm:px-2 text-[10px] sm:text-xs"
              onClick={() => setPlaySpeed(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Separator (hidden on mobile) */}
        <div className="hidden sm:block w-px h-6 bg-border" />

        {/* Flip board */}
        {onFlipBoard && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9"
            onClick={onFlipBoard}
            title="Flip board (F)"
          >
            <FlipVertical className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
