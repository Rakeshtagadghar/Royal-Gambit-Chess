'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { PieceSymbol, Color } from 'chess.js';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface PromotionModalProps {
  isOpen: boolean;
  color: Color;
  onSelect: (piece: PieceSymbol) => void;
  onCancel: () => void;
}

const PROMOTION_PIECES: PieceSymbol[] = ['q', 'r', 'b', 'n'];

const PIECE_CHARS: Record<string, string> = {
  'wq': '♕',
  'wr': '♖',
  'wb': '♗',
  'wn': '♘',
  'bq': '♛',
  'br': '♜',
  'bb': '♝',
  'bn': '♞',
};

const PIECE_NAMES: Record<PieceSymbol, string> = {
  q: 'Queen',
  r: 'Rook',
  b: 'Bishop',
  n: 'Knight',
  p: 'Pawn',
  k: 'King',
};

export function PromotionModal({ isOpen, color, onSelect, onCancel }: PromotionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold">Choose Promotion</h2>
          <p className="text-muted-foreground text-sm">Select a piece to promote your pawn</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <AnimatePresence>
            {PROMOTION_PIECES.map((piece, index) => (
              <motion.button
                key={piece}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelect(piece)}
                className="aspect-square flex flex-col items-center justify-center p-2 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors group"
              >
                <span className="text-5xl leading-none group-hover:scale-110 transition-transform">
                  {PIECE_CHARS[`${color}${piece}`]}
                </span>
                <span className="text-xs mt-1 font-medium">{PIECE_NAMES[piece]}</span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

