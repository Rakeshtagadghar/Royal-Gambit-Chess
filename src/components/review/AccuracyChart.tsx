'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { MoveAnalysis, MoveClassification } from '@/types/chess';

interface AccuracyChartProps {
  moves: MoveAnalysis[];
  currentPly: number;
  onMoveClick: (ply: number) => void;
  className?: string;
}

const classificationColors: Record<MoveClassification, string> = {
  best: '#22c55e',
  good: '#3b82f6',
  inaccuracy: '#eab308',
  mistake: '#f97316',
  blunder: '#ef4444',
};

function evalToY(evalAfter: { type: string; value: number }): number {
  // Convert evaluation to Y position (0-100, where 50 is equal)
  if (evalAfter.type === 'mate') {
    return evalAfter.value > 0 ? 95 : 5;
  }

  const cp = evalAfter.value;
  const clampedCp = Math.max(-1000, Math.min(1000, cp));

  // Sigmoid-like scaling
  const y = 50 + (45 * (2 / (1 + Math.exp(-clampedCp / 200)) - 1));
  return Math.max(5, Math.min(95, y));
}

export function AccuracyChart({ moves, currentPly, onMoveClick, className }: AccuracyChartProps) {
  const chartData = useMemo(() => {
    if (moves.length === 0) return { points: [], markers: [], path: '' };

    const width = 100;
    const height = 100;
    const padding = 5;
    const plotWidth = width - padding * 2;
    const plotHeight = height - padding * 2;

    const points: { x: number; y: number; ply: number; classification: MoveClassification }[] = [];

    // Starting position (eval 0)
    points.push({
      x: padding,
      y: height / 2,
      ply: 0,
      classification: 'good',
    });

    moves.forEach((move, index) => {
      const x = padding + ((index + 1) / moves.length) * plotWidth;
      const y = height - padding - (evalToY(move.eval_after) / 100) * plotHeight;

      points.push({
        x,
        y,
        ply: move.ply,
        classification: move.classification,
      });
    });

    // Create smooth path
    const path = points.length > 1
      ? `M ${points[0].x} ${points[0].y} ` +
        points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')
      : '';

    // Find markers for inaccuracies, mistakes, blunders
    const markers = points.filter(
      (p) =>
        p.classification === 'inaccuracy' ||
        p.classification === 'mistake' ||
        p.classification === 'blunder'
    );

    return { points, markers, path };
  }, [moves]);

  const currentPoint = useMemo(() => {
    return chartData.points.find((p) => p.ply === currentPly);
  }, [chartData.points, currentPly]);

  if (moves.length === 0) {
    return (
      <div className={cn('h-32 bg-card rounded-lg border flex items-center justify-center', className)}>
        <span className="text-muted-foreground text-sm">No moves to display</span>
      </div>
    );
  }

  return (
    <div className={cn('relative h-24 sm:h-32 bg-card rounded-lg border overflow-hidden', className)}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {/* Background gradient */}
        <defs>
          <linearGradient id="evalGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(255, 255, 255)" stopOpacity="0.1" />
            <stop offset="50%" stopColor="rgb(128, 128, 128)" stopOpacity="0.05" />
            <stop offset="100%" stopColor="rgb(0, 0, 0)" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100" height="100" fill="url(#evalGradient)" />

        {/* Center line (equal position) */}
        <line
          x1="5"
          y1="50"
          x2="95"
          y2="50"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="2,2"
          className="text-muted-foreground/30"
        />

        {/* Evaluation line */}
        {chartData.path && (
          <path
            d={chartData.path}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary"
          />
        )}

        {/* Area fill under the line */}
        {chartData.points.length > 1 && (
          <path
            d={`${chartData.path} L ${chartData.points[chartData.points.length - 1].x} 100 L 5 100 Z`}
            fill="currentColor"
            fillOpacity="0.1"
            className="text-primary"
          />
        )}

        {/* Error markers */}
        {chartData.markers.map((marker, index) => (
          <circle
            key={index}
            cx={marker.x}
            cy={marker.y}
            r={marker.classification === 'blunder' ? 3 : marker.classification === 'mistake' ? 2.5 : 2}
            fill={classificationColors[marker.classification]}
            className="cursor-pointer hover:opacity-80"
            onClick={() => onMoveClick(marker.ply)}
          />
        ))}

        {/* Current position indicator */}
        {currentPoint && (
          <circle
            cx={currentPoint.x}
            cy={currentPoint.y}
            r="3"
            fill="currentColor"
            className="text-primary"
            stroke="white"
            strokeWidth="1"
          />
        )}

        {/* Click zones for navigation */}
        {chartData.points.map((point, index) => (
          <rect
            key={index}
            x={point.x - (index === 0 ? 5 : (95 / moves.length) / 2)}
            y="0"
            width={index === 0 ? 5 : 95 / moves.length}
            height="100"
            fill="transparent"
            className="cursor-pointer"
            onClick={() => onMoveClick(point.ply)}
          />
        ))}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-0.5 sm:bottom-1 right-0.5 sm:right-1 flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground bg-background/90 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
        <span className="flex items-center gap-0.5 sm:gap-1">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-500 flex-shrink-0" />
          <span className="hidden sm:inline">Inaccuracy</span>
          <span className="sm:hidden">Inacc</span>
        </span>
        <span className="flex items-center gap-0.5 sm:gap-1">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-orange-500 flex-shrink-0" />
          <span className="hidden sm:inline">Mistake</span>
          <span className="sm:hidden">Mist</span>
        </span>
        <span className="flex items-center gap-0.5 sm:gap-1">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 flex-shrink-0" />
          <span className="hidden sm:inline">Blunder</span>
          <span className="sm:hidden">Blun</span>
        </span>
      </div>
    </div>
  );
}
