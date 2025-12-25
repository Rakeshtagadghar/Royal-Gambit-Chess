'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { PieceSymbol } from 'chess.js';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/stores/gameStore';

interface CapturedPiecesProps {
  color: 'white' | 'black';
  className?: string;
}

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

const PIECE_CHARS: Record<PieceSymbol, { white: string; black: string }> = {
  p: { white: '♙', black: '♟' },
  n: { white: '♘', black: '♞' },
  b: { white: '♗', black: '♝' },
  r: { white: '♖', black: '♜' },
  q: { white: '♕', black: '♛' },
  k: { white: '♔', black: '♚' },
};

export function CapturedPieces({ color, className }: CapturedPiecesProps) {
  const { boardState } = useGameStore();
  
  // Get captured pieces by this player (pieces they captured from opponent)
  const captured = color === 'white' 
    ? boardState.capturedPieces.white 
    : boardState.capturedPieces.black;

  // Calculate material advantage
  const myCaptures = captured.reduce((sum, p) => sum + PIECE_VALUES[p], 0);
  const opponentCaptures = (color === 'white' 
    ? boardState.capturedPieces.black 
    : boardState.capturedPieces.white
  ).reduce((sum, p) => sum + PIECE_VALUES[p], 0);
  const advantage = myCaptures - opponentCaptures;

  // Group and sort pieces
  const sortedPieces = [...captured].sort((a, b) => PIECE_VALUES[b] - PIECE_VALUES[a]);
  
  // Opponent's piece color (what this player captured)
  const pieceColor = color === 'white' ? 'black' : 'white';

  if (sortedPieces.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-0.5 flex-wrap', className)}>
      <AnimatePresence mode="popLayout">
        {sortedPieces.map((piece, index) => (
          <motion.span
            key={`${piece}-${index}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="text-sm leading-none opacity-80"
          >
            {PIECE_CHARS[piece][pieceColor]}
          </motion.span>
        ))}
      </AnimatePresence>
      {advantage > 0 && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-muted-foreground ml-1"
        >
          +{advantage}
        </motion.span>
      )}
    </div>
  );
}

