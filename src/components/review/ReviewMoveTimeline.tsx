'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Star, ThumbsUp, AlertCircle, AlertTriangle, XCircle } from 'lucide-react';
import type { MoveAnalysis, MoveClassification } from '@/types/chess';

interface ReviewMoveTimelineProps {
  moves: MoveAnalysis[];
  currentPly: number;
  onMoveClick: (ply: number) => void;
  className?: string;
}

const classificationIcons: Record<
  MoveClassification,
  { icon: typeof Star; color: string; bgColor: string }
> = {
  best: { icon: Star, color: 'text-green-500', bgColor: 'bg-green-500/20' },
  good: { icon: ThumbsUp, color: 'text-blue-500', bgColor: 'bg-blue-500/20' },
  inaccuracy: { icon: AlertCircle, color: 'text-yellow-500', bgColor: 'bg-yellow-500/20' },
  mistake: { icon: AlertTriangle, color: 'text-orange-500', bgColor: 'bg-orange-500/20' },
  blunder: { icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-500/20' },
};

interface MoveRowProps {
  moveNumber: number;
  whiteMove?: MoveAnalysis;
  blackMove?: MoveAnalysis;
  currentPly: number;
  onMoveClick: (ply: number) => void;
}

function MoveRow({ moveNumber, whiteMove, blackMove, currentPly, onMoveClick }: MoveRowProps) {
  return (
    <div className="flex items-center gap-0.5 sm:gap-1 py-0.5 sm:py-1 border-b border-border/50 last:border-0">
      {/* Move number */}
      <div className="w-6 sm:w-8 text-[10px] sm:text-xs text-muted-foreground font-mono flex-shrink-0">
        {moveNumber}.
      </div>

      {/* White move */}
      <MoveCell
        move={whiteMove}
        isActive={whiteMove?.ply === currentPly}
        onClick={() => whiteMove && onMoveClick(whiteMove.ply)}
      />

      {/* Black move */}
      <MoveCell
        move={blackMove}
        isActive={blackMove?.ply === currentPly}
        onClick={() => blackMove && onMoveClick(blackMove.ply)}
      />
    </div>
  );
}

interface MoveCellProps {
  move?: MoveAnalysis;
  isActive: boolean;
  onClick: () => void;
}

function MoveCell({ move, isActive, onClick }: MoveCellProps) {
  if (!move) {
    return <div className="flex-1" />;
  }

  const config = classificationIcons[move.classification];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm transition-colors min-w-0',
        'hover:bg-accent/50',
        isActive && 'bg-accent ring-1 ring-primary'
      )}
    >
      <Icon className={cn('h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0', config.color)} />
      <span className="font-medium truncate">{move.played_move_san}</span>
      {move.eval_loss_cp > 0 && move.classification !== 'best' && (
        <span className="text-[10px] sm:text-xs text-muted-foreground ml-auto flex-shrink-0">
          -{move.eval_loss_cp > 999 ? '∞' : move.eval_loss_cp}
        </span>
      )}
    </button>
  );
}

export function ReviewMoveTimeline({
  moves,
  currentPly,
  onMoveClick,
  className,
}: ReviewMoveTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRowRef = useRef<HTMLDivElement>(null);

  // Group moves by pairs (white + black)
  const movePairs: { moveNumber: number; white?: MoveAnalysis; black?: MoveAnalysis }[] = [];

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const moveNumber = Math.floor((move.ply + 1) / 2);

    if (move.ply % 2 === 1) {
      // White move (odd ply)
      movePairs.push({ moveNumber, white: move });
    } else {
      // Black move (even ply)
      const lastPair = movePairs[movePairs.length - 1];
      if (lastPair && lastPair.moveNumber === moveNumber) {
        lastPair.black = move;
      } else {
        movePairs.push({ moveNumber, black: move });
      }
    }
  }

  // Auto-scroll to active move
  useEffect(() => {
    if (activeRowRef.current) {
      activeRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentPly]);

  return (
    <ScrollArea className={cn('h-64 sm:h-80', className)} ref={scrollRef}>
      <div className="p-1.5 sm:p-2">
        {/* Starting position button */}
        <button
          onClick={() => onMoveClick(0)}
          className={cn(
            'w-full flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded text-xs sm:text-sm text-muted-foreground transition-colors mb-0.5 sm:mb-1',
            'hover:bg-accent/50',
            currentPly === 0 && 'bg-accent ring-1 ring-primary text-foreground'
          )}
        >
          Starting position
        </button>

        {/* Move list */}
        {movePairs.map((pair) => {
          const isActiveRow =
            (pair.white && pair.white.ply === currentPly) ||
            (pair.black && pair.black.ply === currentPly);

          return (
            <div
              key={pair.moveNumber}
              ref={isActiveRow ? activeRowRef : undefined}
            >
              <MoveRow
                moveNumber={pair.moveNumber}
                whiteMove={pair.white}
                blackMove={pair.black}
                currentPly={currentPly}
                onMoveClick={onMoveClick}
              />
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
