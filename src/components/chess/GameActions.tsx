'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { useGameStore } from '@/stores/gameStore';
import { Flag, Handshake, RotateCcw, Play, SkipBack, SkipForward, ChevronsLeft, ChevronsRight, FlipVertical } from 'lucide-react';

interface GameActionsProps {
  onResign?: () => void;
  onOfferDraw?: () => void;
  onAbort?: () => void;
  onRematch?: () => void;
  onNewGame?: () => void;
  showRematch?: boolean;
}

export function GameActions({
  onResign,
  onOfferDraw,
  onAbort,
  onRematch,
  onNewGame,
  showRematch = false,
}: GameActionsProps) {
  const { status, boardState, mode, undoMove, flipBoard } = useGameStore();
  const [confirmAction, setConfirmAction] = useState<'resign' | 'draw' | 'abort' | null>(null);

  const moveCount = boardState.moveHistory.length;
  const canAbort = status === 'active' && moveCount <= 2;
  const canResign = status === 'active' && moveCount > 2;
  const canDraw = status === 'active' && moveCount > 10;
  const canUndo = status === 'active' && mode === 'bot' && moveCount >= 2;
  const isGameOver = status === 'finished';

  const handleConfirm = () => {
    switch (confirmAction) {
      case 'resign':
        onResign?.();
        break;
      case 'draw':
        onOfferDraw?.();
        break;
      case 'abort':
        onAbort?.();
        break;
    }
    setConfirmAction(null);
  };

  return (
    <div className="space-y-3">
      {/* Game controls */}
      <div className="flex flex-wrap gap-2">
        {!isGameOver && (
          <>
            {canAbort && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmAction('abort')}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Abort
              </Button>
            )}
            {canResign && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmAction('resign')}
              >
                <Flag className="h-4 w-4 mr-1" />
                Resign
              </Button>
            )}
            {canDraw && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmAction('draw')}
              >
                <Handshake className="h-4 w-4 mr-1" />
                Offer Draw
              </Button>
            )}
            {canUndo && (
              <Button
                variant="outline"
                size="sm"
                onClick={undoMove}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Undo
              </Button>
            )}
          </>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={flipBoard}
        >
          <FlipVertical className="h-4 w-4 mr-1" />
          Flip
        </Button>

        {isGameOver && showRematch && (
          <>
            <Button
              variant="default"
              size="sm"
              onClick={onRematch}
            >
              <Play className="h-4 w-4 mr-1" />
              Rematch
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNewGame}
            >
              New Game
            </Button>
          </>
        )}
      </div>

      {/* Confirmation dialog */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === 'resign' && 'Resign Game?'}
              {confirmAction === 'draw' && 'Offer Draw?'}
              {confirmAction === 'abort' && 'Abort Game?'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === 'resign' && 'This will count as a loss. Are you sure you want to resign?'}
              {confirmAction === 'draw' && 'Your opponent will need to accept the draw offer.'}
              {confirmAction === 'abort' && 'The game will be cancelled and not counted.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button 
              variant={confirmAction === 'resign' ? 'destructive' : 'default'}
              onClick={handleConfirm}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function MoveControls() {
  const { boardState, viewingMoveIndex, viewMove } = useGameStore();
  const totalMoves = boardState.moveHistory.length;

  const goToStart = () => viewMove(-1);
  const goBack = () => viewMove(viewingMoveIndex - 1);
  const goForward = () => viewMove(viewingMoveIndex + 1);
  const goToEnd = () => viewMove(totalMoves - 1);

  const isAtStart = viewingMoveIndex === -1;
  const isAtEnd = viewingMoveIndex === totalMoves - 1;

  return (
    <motion.div 
      className="flex items-center justify-center gap-1"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={goToStart}
        disabled={isAtStart}
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={goBack}
        disabled={isAtStart}
      >
        <SkipBack className="h-4 w-4" />
      </Button>
      <span className="px-3 text-sm text-muted-foreground min-w-[60px] text-center">
        {viewingMoveIndex + 1} / {totalMoves}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={goForward}
        disabled={isAtEnd}
      >
        <SkipForward className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={goToEnd}
        disabled={isAtEnd}
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}

