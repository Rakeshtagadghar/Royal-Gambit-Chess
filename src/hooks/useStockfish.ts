'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Square } from 'chess.js';
import { getStockfishEngine, StockfishEngine } from '@/lib/stockfish/engine';
import { BotDifficulty } from '@/types/chess';

interface UseStockfishOptions {
  difficulty: BotDifficulty;
  onMove: (from: Square, to: Square, promotion?: string) => void;
  enabled?: boolean;
}

export function useStockfish({ difficulty, onMove, enabled = true }: UseStockfishOptions) {
  const [isReady, setIsReady] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const engineRef = useRef<StockfishEngine | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize engine
  useEffect(() => {
    if (!enabled) return;

    const initEngine = async () => {
      try {
        const engine = getStockfishEngine();
        await engine.init();
        engineRef.current = engine;
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize Stockfish:', error);
        // Fallback: we'll use random moves
        setIsReady(true);
      }
    };

    initEngine();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled]);

  // Get best move
  const think = useCallback(
    async (fen: string) => {
      if (!enabled) return;
      
      setIsThinking(true);

      // Add artificial delay to make it feel more human
      const minThinkTime = 250;
      const startTime = Date.now();

      const makeMove = (moveStr: string) => {
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(0, minThinkTime - elapsed);

        timeoutRef.current = setTimeout(() => {
          // Parse UCI move format (e.g., "e2e4" or "e7e8q")
          const from = moveStr.substring(0, 2) as Square;
          const to = moveStr.substring(2, 4) as Square;
          const promotion = moveStr.length > 4 ? moveStr[4] : undefined;
          
          onMove(from, to, promotion);
          setIsThinking(false);
        }, remainingDelay);
      };

      try {
        if (engineRef.current) {
          // Add some randomness for lower difficulties
          const difficultyIndex = ['Beginner', 'Easy', 'Medium', 'Hard', 'Expert'].indexOf(difficulty.label);
          
          // For beginner/easy, sometimes make a random move
          if (difficultyIndex < 2 && Math.random() < 0.1) {
            // Make a random legal move (handled by fallback)
            throw new Error('Random move for variety');
          }
          
          await engineRef.current.getBestMove(fen, difficulty, makeMove);
        } else {
          throw new Error('Engine not available');
        }
      } catch {
        // Fallback: generate a random legal move
        const { Chess } = await import('chess.js');
        const game = new Chess(fen);
        const moves = game.moves({ verbose: true });
        
        if (moves.length > 0) {
          const randomMove = moves[Math.floor(Math.random() * moves.length)];
          makeMove(randomMove.from + randomMove.to + (randomMove.promotion || ''));
        } else {
          setIsThinking(false);
        }
      }
    },
    [enabled, difficulty, onMove]
  );

  // Stop thinking
  const stop = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsThinking(false);
  }, []);

  return {
    isReady,
    isThinking,
    think,
    stop,
  };
}

