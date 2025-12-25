'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Square, PieceSymbol } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore, BOARD_THEMES } from '@/stores/settingsStore';
import { PromotionModal } from './PromotionModal';
import { ConfettiRain } from './ConfettiRain';

interface ChessBoardProps {
  onMove?: (from: Square, to: Square, promotion: PieceSymbol | undefined, clientPly: number) => void;
  interactive?: boolean;
}

export function ChessBoard({ onMove, interactive = true }: ChessBoardProps) {
  const {
    game,
    boardState,
    selectedSquare,
    highlightedSquares,
    boardOrientation,
    viewingMoveIndex,
    playerColor,
    status,
    result,
    selectSquare,
    makeMove,
  } = useGameStore();

  const {
    boardTheme,
    showLegalMoves,
    showLastMove,
    highlightCheck,
    enableAnimations,
    animationSpeed,
  } = useSettingsStore();

  const [promotionMove, setPromotionMove] = useState<{ from: Square; to: Square } | null>(null);
  const [boardWidth, setBoardWidth] = useState(560);

  const shouldConfetti =
    status === 'finished' &&
    !!playerColor &&
    ((playerColor === 'w' && result === '1-0') || (playerColor === 'b' && result === '0-1'));

  // Responsive board sizing
  useEffect(() => {
    const updateSize = () => {
      const maxWidth = Math.min(window.innerWidth - 32, 560);
      const maxHeight = window.innerHeight - 200;
      setBoardWidth(Math.min(maxWidth, maxHeight));
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Get the FEN for display (either current or historical position)
  const displayFen = useMemo(() => {
    if (viewingMoveIndex === -1) {
      return new Chess().fen(); // Starting position
    }
    if (viewingMoveIndex === boardState.moveHistory.length - 1) {
      return boardState.fen;
    }
    return boardState.moveHistory[viewingMoveIndex]?.fen || boardState.fen;
  }, [viewingMoveIndex, boardState.moveHistory, boardState.fen]);

  // A chess.js instance that matches what we are currently displaying on the board.
  const displayChess = useMemo(() => {
    try {
      return new Chess(displayFen);
    } catch {
      return game;
    }
  }, [displayFen, game]);

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
      if (!interactive) return false;
      if (status !== 'active') return false;
      if (!targetSquare) return false;
      
      const source = sourceSquare as Square;
      const target = targetSquare as Square;
      
      // Check if it's viewing history
      if (viewingMoveIndex !== boardState.moveHistory.length - 1) return false;
      
      // Check if it's player's turn
      if (playerColor && boardState.turn !== playerColor) return false;

      // Check for promotion
      if (isPromotionMove(source, target)) {
        setPromotionMove({ from: source, to: target });
        return false;
      }

      const clientPly = boardState.moveHistory.length;
      const success = makeMove(source, target);
      if (success) {
        onMove?.(source, target, undefined, clientPly);
        selectSquare(null);
      }
      return success;
    },
    [interactive, status, viewingMoveIndex, boardState.moveHistory.length, boardState.turn, playerColor, isPromotionMove, makeMove, onMove, selectSquare]
  );

  // Handle square click for click-to-move
  const handleSquareClick = useCallback(
    ({ square }: { piece: unknown; square: string }) => {
      const sq = square as Square;
      
      if (!interactive) return;
      if (status !== 'active') return;
      
      // Check if it's viewing history
      if (viewingMoveIndex !== boardState.moveHistory.length - 1) return;

      // If there's a selected square and this is a valid target
      if (selectedSquare) {
        const legalTargets = boardState.legalMoves.get(selectedSquare) || [];
        if (legalTargets.includes(sq)) {
          // Check for promotion
          if (isPromotionMove(selectedSquare, sq)) {
            setPromotionMove({ from: selectedSquare, to: sq });
            return;
          }

          const clientPly = boardState.moveHistory.length;
          const success = makeMove(selectedSquare, sq);
          if (success) {
            onMove?.(selectedSquare, sq, undefined, clientPly);
          }
          selectSquare(null);
          return;
        }
      }

      // Select the square
      selectSquare(sq);
    },
    [interactive, status, viewingMoveIndex, boardState.moveHistory.length, boardState.legalMoves, selectedSquare, isPromotionMove, makeMove, onMove, selectSquare]
  );

  // Handle promotion selection
  const handlePromotion = useCallback(
    (piece: PieceSymbol) => {
      if (!promotionMove) return;

      const clientPly = boardState.moveHistory.length;
      const success = makeMove(promotionMove.from, promotionMove.to, piece);
      if (success) {
        onMove?.(promotionMove.from, promotionMove.to, piece, clientPly);
      }
      setPromotionMove(null);
      selectSquare(null);
    },
    [promotionMove, makeMove, onMove, selectSquare, boardState.moveHistory.length]
  );

  // Get squares with movable pieces (pieces that have legal moves)
  const movableSquares = useMemo(() => {
    const squares: Square[] = [];
    if (interactive && status === 'active') {
      // Only highlight pieces that belong to the current player
      const isPlayerTurn = !playerColor || boardState.turn === playerColor;
      if (isPlayerTurn) {
        boardState.legalMoves.forEach((targets, square) => {
          if (targets.length > 0) {
            squares.push(square);
          }
        });
      }
    }
    return squares;
  }, [interactive, status, playerColor, boardState.turn, boardState.legalMoves]);

  // Custom square styles
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    
    // Highlight squares with movable pieces
    if (showLegalMoves && !selectedSquare) {
      movableSquares.forEach((square) => {
        styles[square] = {
          boxShadow: 'inset 0 0 0 3px rgba(100, 200, 100, 0.4)',
        };
      });
    }
    
    // Selected square
    if (selectedSquare && showLegalMoves) {
      styles[selectedSquare] = {
        backgroundColor: 'rgba(100, 200, 100, 0.5)',
      };
    }

    // Legal move highlights
    if (showLegalMoves) {
      highlightedSquares.forEach((square) => {
        const piece = displayChess.get(square as Square);
        styles[square] = {
          background: piece
            ? 'radial-gradient(circle, transparent 60%, rgba(100, 200, 100, 0.5) 60%)'
            : 'radial-gradient(circle, rgba(100, 200, 100, 0.5) 25%, transparent 25%)',
        };
      });
    }

    // Last move highlight
    if (showLastMove && boardState.lastMove) {
      const lastMoveStyle = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
      styles[boardState.lastMove.from] = { ...styles[boardState.lastMove.from], ...lastMoveStyle };
      styles[boardState.lastMove.to] = { ...styles[boardState.lastMove.to], ...lastMoveStyle };
    }

    // Check highlight
    if (highlightCheck && displayChess.isCheck()) {
      // chess.js `isCheck()` means the side to move is in check.
      const kingColor = displayChess.turn();
      const kingSquare = findKingSquare(displayChess, kingColor);
      if (kingSquare) {
        styles[kingSquare] = {
          ...styles[kingSquare],
          backgroundColor: 'rgba(255, 0, 0, 0.5)',
          boxShadow: 'inset 0 0 10px 5px rgba(255, 0, 0, 0.5)',
        };
      }
    }

    return styles;
  }, [selectedSquare, highlightedSquares, boardState.lastMove, showLegalMoves, showLastMove, highlightCheck, displayChess, movableSquares]);

  const themeColors = BOARD_THEMES[boardTheme];

  return (
    <div className="relative" style={{ width: boardWidth, height: boardWidth }}>
      <ConfettiRain active={shouldConfetti} />
      <motion.div
        className="board-container"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Chessboard
          options={{
            id: 'chess-board',
            position: displayFen,
            onPieceDrop: handlePieceDrop,
            onSquareClick: handleSquareClick,
            boardOrientation: boardOrientation,
            squareStyles: customSquareStyles,
            boardStyle: {
              borderRadius: '4px',
              width: `${boardWidth}px`,
              height: `${boardWidth}px`,
            },
            darkSquareStyle: { backgroundColor: themeColors.dark },
            lightSquareStyle: { backgroundColor: themeColors.light },
            animationDurationInMs: enableAnimations ? animationSpeed : 0,
            showAnimations: enableAnimations,
            allowDragging: interactive && status === 'active',
            showNotation: true,
            onPieceDrag: ({ square }) => {
              if (square) selectSquare(square as Square);
            },
          }}
        />
      </motion.div>

      {/* Game over overlay */}
      <AnimatePresence>
        {status === 'finished' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center rounded"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-card text-card-foreground p-6 rounded-lg shadow-xl text-center"
            >
              <GameOverMessage />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Promotion modal */}
      <PromotionModal
        isOpen={!!promotionMove}
        color={boardState.turn}
        onSelect={handlePromotion}
        onCancel={() => setPromotionMove(null)}
      />
    </div>
  );
}

function GameOverMessage() {
  const { result, termination, playerColor } = useGameStore();

  const getMessage = () => {
    if (result === '1/2-1/2') return "It's a draw!";

    // If you're playing, make it player-centric.
    if (playerColor) {
      const youWon = (playerColor === 'w' && result === '1-0') || (playerColor === 'b' && result === '0-1');
      if (youWon) return 'You won!';
      return 'Good game!';
    }

    if (result === '1-0') return 'White wins!';
    if (result === '0-1') return 'Black wins!';
    return 'Game Over';
  };

  const getReason = () => {
    switch (termination) {
      case 'checkmate': return 'by checkmate';
      case 'resign': return 'by resignation';
      case 'timeout': return 'on time';
      case 'stalemate': return 'by stalemate';
      case 'draw_agreement': return 'by agreement';
      case 'insufficient_material': return 'insufficient material';
      case 'threefold_repetition': return 'threefold repetition';
      case 'fifty_move_rule': return 'fifty move rule';
      default: return '';
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-2">{getMessage()}</h2>
      <p className="text-muted-foreground">{getReason()}</p>
      {playerColor && (result === '1-0' || result === '0-1' || result === '1/2-1/2') && (
        <p className="text-sm text-muted-foreground mt-3">
          {result === '1/2-1/2'
            ? 'Well played by both sides — want a rematch?'
            : (playerColor === 'w' && result === '1-0') || (playerColor === 'b' && result === '0-1')
              ? 'Nice work — want a rematch?'
              : 'You’ll come back stronger next time. Keep practicing and try again!'}
        </p>
      )}
    </>
  );
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
