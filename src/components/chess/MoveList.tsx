'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/stores/gameStore';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MoveListProps {
  className?: string;
}

export function MoveList({ className }: MoveListProps) {
  const { boardState, viewingMoveIndex, viewMove } = useGameStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMoveRef = useRef<HTMLButtonElement>(null);

  const moves = boardState.moveHistory;

  // Auto-scroll to latest move
  useEffect(() => {
    if (viewingMoveIndex === moves.length - 1 && lastMoveRef.current) {
      lastMoveRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [viewingMoveIndex, moves.length]);

  // Group moves into pairs (white, black)
  const movePairs: { moveNumber: number; white?: { san: string; index: number }; black?: { san: string; index: number } }[] = [];
  
  moves.forEach((move, index) => {
    const moveNumber = Math.floor(index / 2) + 1;
    const isWhite = index % 2 === 0;
    
    if (isWhite) {
      movePairs.push({ moveNumber, white: { san: move.san, index } });
    } else {
      movePairs[movePairs.length - 1].black = { san: move.san, index };
    }
  });

  if (moves.length === 0) {
    return (
      <div className={cn('p-4 text-center text-muted-foreground', className)}>
        <p className="text-sm">No moves yet</p>
        <p className="text-xs mt-1">Make a move to start</p>
      </div>
    );
  }

  return (
    <ScrollArea className={cn('h-[200px]', className)} ref={scrollRef}>
      <div className="p-2 space-y-1">
        {movePairs.map((pair, pairIndex) => (
          <motion.div
            key={pair.moveNumber}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: pairIndex * 0.02 }}
            className="flex items-center gap-1 text-sm"
          >
            <span className="w-8 text-muted-foreground font-mono text-right shrink-0">
              {pair.moveNumber}.
            </span>
            {pair.white && (
              <button
                ref={pair.white.index === moves.length - 1 ? lastMoveRef : undefined}
                onClick={() => viewMove(pair.white!.index)}
                className={cn(
                  'move-list-item flex-1 font-mono text-left',
                  viewingMoveIndex === pair.white.index && 'active'
                )}
              >
                {pair.white.san}
              </button>
            )}
            {pair.black ? (
              <button
                ref={pair.black.index === moves.length - 1 ? lastMoveRef : undefined}
                onClick={() => viewMove(pair.black!.index)}
                className={cn(
                  'move-list-item flex-1 font-mono text-left',
                  viewingMoveIndex === pair.black.index && 'active'
                )}
              >
                {pair.black.san}
              </button>
            ) : (
              <span className="flex-1" />
            )}
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
}

