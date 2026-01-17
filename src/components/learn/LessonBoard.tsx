'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Square, PieceSymbol } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';
import { useLearnStore } from '@/stores/learnStore';
import { useSettingsStore, BOARD_THEMES } from '@/stores/settingsStore';
import { PromotionModal } from '@/components/chess/PromotionModal';
import { StepArrow } from '@/types/learn';

interface LessonBoardProps {
  interactive?: boolean;
  showCoordinates?: boolean;
}

export function LessonBoard({ interactive = true, showCoordinates = true }: LessonBoardProps) {
  const {
    game,
    currentFen,
    selectedSquare,
    highlightedSquares,
    arrows,
    customHighlights,
    pieceToMove,
    boardOrientation,
    stepCompleted,
    makeMove,
    selectSquare,
  } = useLearnStore();

  const { boardTheme, enableAnimations, animationSpeed } = useSettingsStore();

  const [promotionMove, setPromotionMove] = useState<{ from: Square; to: Square } | null>(null);
  const [boardWidth, setBoardWidth] = useState(480);

  // Responsive board sizing
  useEffect(() => {
    const updateSize = () => {
      const maxWidth = Math.min(window.innerWidth - 48, 480);
      const maxHeight = window.innerHeight - 300;
      setBoardWidth(Math.min(maxWidth, maxHeight));
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Check if a square needs promotion
  const isPromotionMove = useCallback(
    (from: Square, to: Square) => {
      const piece = game.get(from);
      if (!piece || piece.type !== 'p') return false;

      const toRank = to[1];
      return (piece.color === 'w' && toRank === '8') || (piece.color === 'b' && toRank === '1');
    },
    [game]
  );

  // Handle piece drop
  const handlePieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: { piece: unknown; sourceSquare: string; targetSquare: string | null }) => {
      if (!interactive || stepCompleted) return false;
      if (!targetSquare) return false;

      const source = sourceSquare as Square;
      const target = targetSquare as Square;

      // Check for promotion
      if (isPromotionMove(source, target)) {
        setPromotionMove({ from: source, to: target });
        return false;
      }

      const success = makeMove(source, target);
      if (success) {
        selectSquare(null);
      }
      return success;
    },
    [interactive, stepCompleted, isPromotionMove, makeMove, selectSquare]
  );

  // Handle square click for click-to-move
  const handleSquareClick = useCallback(
    ({ square }: { piece: unknown; square: string }) => {
      const sq = square as Square;

      if (!interactive || stepCompleted) return;

      // If there's a selected square and this is a valid target
      if (selectedSquare) {
        if (highlightedSquares.includes(sq)) {
          // Check for promotion
          if (isPromotionMove(selectedSquare, sq)) {
            setPromotionMove({ from: selectedSquare, to: sq });
            return;
          }

          makeMove(selectedSquare, sq);
          selectSquare(null);
          return;
        }
      }

      selectSquare(sq);
    },
    [interactive, stepCompleted, selectedSquare, highlightedSquares, isPromotionMove, makeMove, selectSquare]
  );

  // Handle promotion selection
  const handlePromotion = useCallback(
    (piece: PieceSymbol) => {
      if (!promotionMove) return;

      makeMove(promotionMove.from, promotionMove.to, piece);
      setPromotionMove(null);
      selectSquare(null);
    },
    [promotionMove, makeMove, selectSquare]
  );

  // Convert arrows to react-chessboard format
  const boardArrows = useMemo(() => {
    return arrows.map((arrow: StepArrow) => ({
      startSquare: arrow.from,
      endSquare: arrow.to,
      color: arrow.color || 'rgba(0, 128, 0, 0.7)',
    }));
  }, [arrows]);

  // Custom square styles
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    // Piece to move highlight (pulsing blue) - applied first so it can be overridden
    if (pieceToMove && !stepCompleted) {
      styles[pieceToMove] = {
        background: 'rgba(59, 130, 246, 0.3)',
      };
    }

    // Selected square
    if (selectedSquare) {
      styles[selectedSquare] = {
        background: 'rgba(100, 200, 100, 0.5)',
      };
    }

    // Legal move highlights
    highlightedSquares.forEach((square) => {
      const piece = game.get(square as Square);
      styles[square] = {
        background: piece
          ? 'radial-gradient(circle, transparent 60%, rgba(100, 200, 100, 0.5) 60%)'
          : 'radial-gradient(circle, rgba(100, 200, 100, 0.5) 25%, transparent 25%)',
      };
    });

    // Custom highlights from step meta
    customHighlights.forEach((square) => {
      styles[square] = {
        ...styles[square],
        background: 'rgba(255, 255, 0, 0.4)',
      };
    });

    // Check highlight
    if (game.isCheck()) {
      const kingColor = game.turn();
      const kingSquare = findKingSquare(game, kingColor);
      if (kingSquare) {
        styles[kingSquare] = {
          ...styles[kingSquare],
          background: 'rgba(255, 0, 0, 0.5)',
          boxShadow: 'inset 0 0 10px 5px rgba(255, 0, 0, 0.5)',
        };
      }
    }

    return styles;
  }, [pieceToMove, stepCompleted, selectedSquare, highlightedSquares, customHighlights, game]);

  const themeColors = BOARD_THEMES[boardTheme];

  return (
    <div className="relative" style={{ width: boardWidth, height: boardWidth }}>
      <motion.div
        className="board-container rounded-lg overflow-hidden shadow-lg"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Chessboard
          options={{
            id: 'lesson-board',
            position: currentFen,
            onPieceDrop: handlePieceDrop,
            onSquareClick: handleSquareClick,
            boardOrientation: boardOrientation,
            squareStyles: customSquareStyles,
            boardStyle: {
              borderRadius: '8px',
              width: `${boardWidth}px`,
              height: `${boardWidth}px`,
            },
            darkSquareStyle: { backgroundColor: themeColors.dark },
            lightSquareStyle: { backgroundColor: themeColors.light },
            animationDurationInMs: enableAnimations ? animationSpeed : 0,
            showAnimations: enableAnimations,
            allowDragging: interactive && !stepCompleted,
            showNotation: showCoordinates,
            arrows: boardArrows,
            onPieceDrag: ({ square }) => {
              if (square && interactive && !stepCompleted) selectSquare(square as Square);
            },
          }}
        />
      </motion.div>

      {/* Piece to move pulsing indicator */}
      <AnimatePresence>
        {pieceToMove && !stepCompleted && !selectedSquare && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute pointer-events-none animate-piece-to-move rounded-sm"
            style={getSquarePosition(pieceToMove, boardWidth, boardOrientation)}
          />
        )}
      </AnimatePresence>

      {/* Step completed overlay */}
      <AnimatePresence>
        {stepCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-green-500/10 rounded-lg pointer-events-none flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="bg-green-500 text-white rounded-full p-3"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Promotion modal */}
      <PromotionModal
        isOpen={!!promotionMove}
        color={game.turn()}
        onSelect={handlePromotion}
        onCancel={() => setPromotionMove(null)}
      />
    </div>
  );
}

function getSquarePosition(
  square: string,
  boardWidth: number,
  orientation: 'white' | 'black'
): React.CSSProperties {
  const squareSize = boardWidth / 8;
  const file = (square.codePointAt(0) ?? 97) - 97; // 'a' = 0, 'h' = 7
  const rank = Number.parseInt(square[1], 10) - 1; // '1' = 0, '8' = 7

  let x: number, y: number;
  if (orientation === 'white') {
    x = file * squareSize;
    y = (7 - rank) * squareSize;
  } else {
    x = (7 - file) * squareSize;
    y = rank * squareSize;
  }

  return {
    left: x,
    top: y,
    width: squareSize,
    height: squareSize,
  };
}

function findKingSquare(game: Chess, color: 'w' | 'b'): Square | null {
  const board = game.board();
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (piece && piece.type === 'k' && piece.color === color) {
        const files = 'abcdefgh';
        const ranks = '87654321';
        return `${files[file]}${ranks[rank]}` as Square;
      }
    }
  }
  return null;
}
