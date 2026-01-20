'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Evaluation } from '@/types/chess';

interface EvaluationBarProps {
  evaluation: Evaluation;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}

function evalToPercentage(evaluation: Evaluation): number {
  if (evaluation.type === 'mate') {
    // Mate: full advantage to the side with mate
    return evaluation.value > 0 ? 100 : 0;
  }

  // Centipawns: convert to percentage (scale -1000 to 1000 cp to 0-100%)
  const cp = evaluation.value;
  const clampedCp = Math.max(-1000, Math.min(1000, cp));

  // Use a sigmoid-like function for smoother scaling
  // This gives 50% at 0 cp, ~75% at +300 cp, ~90% at +600 cp
  const percentage = 50 + (50 * (2 / (1 + Math.exp(-clampedCp / 200)) - 1));

  return Math.max(0, Math.min(100, percentage));
}

function formatEval(evaluation: Evaluation): string {
  if (evaluation.type === 'mate') {
    const mateIn = Math.abs(evaluation.value);
    return evaluation.value > 0 ? `M${mateIn}` : `-M${mateIn}`;
  }

  const cp = evaluation.value;
  const pawns = Math.abs(cp) / 100;
  const formatted = pawns.toFixed(1);

  if (cp === 0) return '0.0';
  return cp > 0 ? `+${formatted}` : `-${formatted}`;
}

export function EvaluationBar({
  evaluation,
  className,
  orientation = 'vertical',
}: EvaluationBarProps) {
  const whitePercentage = useMemo(() => evalToPercentage(evaluation), [evaluation]);
  const evalText = useMemo(() => formatEval(evaluation), [evaluation]);

  const isVertical = orientation === 'vertical';

  return (
    <div
      className={cn(
        'relative bg-gray-900 rounded overflow-hidden',
        isVertical ? 'w-6 h-full' : 'h-6 w-full',
        className
      )}
    >
      {/* White's portion */}
      <motion.div
        className={cn(
          'absolute bg-gray-100',
          isVertical ? 'bottom-0 left-0 right-0' : 'left-0 top-0 bottom-0'
        )}
        initial={false}
        animate={
          isVertical
            ? { height: `${whitePercentage}%` }
            : { width: `${whitePercentage}%` }
        }
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      />

      {/* Evaluation text */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center',
          isVertical ? 'writing-mode-vertical' : ''
        )}
      >
        <span
          className={cn(
            'text-xs font-bold px-1',
            whitePercentage > 50 ? 'text-gray-900' : 'text-gray-100',
            isVertical && 'rotate-180 [writing-mode:vertical-rl]'
          )}
        >
          {evalText}
        </span>
      </div>
    </div>
  );
}

// Compact evaluation display for move list
export function EvaluationBadge({ evaluation }: { evaluation: Evaluation }) {
  const evalText = formatEval(evaluation);
  const isPositive = evaluation.type === 'mate' ? evaluation.value > 0 : evaluation.value > 0;
  const isMate = evaluation.type === 'mate';

  return (
    <span
      className={cn(
        'text-xs font-mono px-1.5 py-0.5 rounded',
        isMate
          ? isPositive
            ? 'bg-green-500/20 text-green-500'
            : 'bg-red-500/20 text-red-500'
          : isPositive
            ? 'bg-gray-100/10 text-gray-300'
            : 'bg-gray-900/50 text-gray-400'
      )}
    >
      {evalText}
    </span>
  );
}
