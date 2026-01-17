'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chess, Square, PieceSymbol } from 'chess.js';
import { useLearnStore } from '@/stores/learnStore';
import { QuizCard } from './QuizCard';
import { HintPanel } from './HintPanel';
import { cn } from '@/lib/utils';
import { Check, AlertCircle, Play, SkipForward, RotateCcw } from 'lucide-react';

// Simple markdown renderer for basic formatting
function SimpleMarkdown({ content }: { content: string }) {
  const lines = content.split('\n');

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        // Headers
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-base font-semibold mt-3">{line.slice(4)}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-lg font-semibold mt-3">{line.slice(3)}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={i} className="text-xl font-bold mt-3">{line.slice(2)}</h1>;
        }

        // List items
        if (line.startsWith('- ')) {
          return (
            <div key={i} className="flex gap-2">
              <span className="text-muted-foreground">•</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }} />
            </div>
          );
        }

        // Empty lines
        if (line.trim() === '') {
          return <div key={i} className="h-2" />;
        }

        // Regular paragraphs with inline formatting
        return (
          <p key={i} dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
        );
      })}
    </div>
  );
}

function formatInline(text: string): string {
  return text
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`(.+?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>');
}

// Model line player component for playing through example lines
function ModelLinePlayer() {
  const { steps, currentStepIndex, game, markStepComplete, stepCompleted } = useLearnStore();
  const [moveIndex, setMoveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const step = steps[currentStepIndex];
  const solutionLine = step?.solutionLineUci || [];

  const playNextMove = useCallback(() => {
    if (moveIndex >= solutionLine.length) {
      setIsPlaying(false);
      markStepComplete();
      return;
    }

    const moveUci = solutionLine[moveIndex];
    const from = moveUci.slice(0, 2) as Square;
    const to = moveUci.slice(2, 4) as Square;
    const promotion = moveUci[4] as PieceSymbol | undefined;

    try {
      game.move({ from, to, promotion });
      useLearnStore.setState({ currentFen: game.fen() });
      setMoveIndex(moveIndex + 1);
    } catch {
      // Invalid move
    }
  }, [game, moveIndex, solutionLine, markStepComplete]);

  const playAll = useCallback(() => {
    setIsPlaying(true);
    const interval = setInterval(() => {
      const { game } = useLearnStore.getState();
      const currentMoveIndex = useLearnStore.getState().currentStepIndex;
      const currentStep = useLearnStore.getState().steps[currentMoveIndex];
      const line = currentStep?.solutionLineUci || [];

      setMoveIndex((prevIndex) => {
        if (prevIndex >= line.length) {
          clearInterval(interval);
          setIsPlaying(false);
          markStepComplete();
          return prevIndex;
        }

        const moveUci = line[prevIndex];
        const from = moveUci.slice(0, 2) as Square;
        const to = moveUci.slice(2, 4) as Square;
        const promotion = moveUci[4] as PieceSymbol | undefined;

        try {
          game.move({ from, to, promotion });
          useLearnStore.setState({ currentFen: game.fen() });
        } catch {
          // Invalid move
        }

        return prevIndex + 1;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [game, markStepComplete]);

  const resetLine = useCallback(() => {
    const initialFen = step?.initialFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    game.load(initialFen);
    useLearnStore.setState({ currentFen: initialFen, stepCompleted: false });
    setMoveIndex(0);
    setIsPlaying(false);
  }, [game, step?.initialFen]);

  if (solutionLine.length === 0) {
    return null;
  }

  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
      <p className="text-sm text-amber-200 mb-3">
        Watch the example line ({moveIndex}/{solutionLine.length} moves)
      </p>
      <div className="flex gap-2">
        <button
          onClick={playNextMove}
          disabled={isPlaying || stepCompleted || moveIndex >= solutionLine.length}
          className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm text-white transition-colors"
        >
          <SkipForward className="w-4 h-4" />
          Next
        </button>
        <button
          onClick={playAll}
          disabled={isPlaying || stepCompleted || moveIndex >= solutionLine.length}
          className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm text-white transition-colors"
        >
          <Play className="w-4 h-4" />
          Play All
        </button>
        <button
          onClick={resetLine}
          disabled={isPlaying}
          className="flex items-center gap-1 px-3 py-1.5 bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  );
}

export function StepContent() {
  const {
    steps,
    currentStepIndex,
    stepCompleted,
    wrongMoveMessage,
    correctMoveMessage,
  } = useLearnStore();

  const step = steps[currentStepIndex];

  if (!step) return null;

  return (
    <div className="space-y-4">
      {/* Step title */}
      {step.title && (
        <h2 className="text-xl font-semibold">{step.title}</h2>
      )}

      {/* Step body content */}
      {step.bodyMd && (
        <div className="text-sm leading-relaxed">
          <SimpleMarkdown content={step.bodyMd} />
        </div>
      )}

      {/* Quiz content */}
      {step.type === 'quiz' && <QuizCard />}

      {/* Move task instructions */}
      {step.type === 'move_task' && !stepCompleted && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <p className="text-sm text-blue-200">
            Find the best move for {step.initialFen?.includes(' w ') ? 'White' : 'Black'}
            {step.meta?.pieceToMove && (
              <span className="block mt-1 font-medium">
                Move the piece on <span className="uppercase font-bold text-blue-300">{step.meta.pieceToMove}</span>
              </span>
            )}
          </p>
        </div>
      )}

      {/* Puzzle instructions */}
      {step.type === 'puzzle' && !stepCompleted && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
          <p className="text-sm text-purple-200">
            Solve the puzzle - find the winning sequence!
          </p>
        </div>
      )}

      {/* Model line instructions */}
      {step.type === 'model_line' && (
        <ModelLinePlayer />
      )}

      {/* Feedback messages */}
      <AnimatePresence mode="wait">
        {wrongMoveMessage && !stepCompleted && (
          <motion.div
            key="wrong"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-3"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-200">{wrongMoveMessage}</p>
            </div>
          </motion.div>
        )}

        {correctMoveMessage && stepCompleted && (
          <motion.div
            key="correct"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-green-500/10 border border-green-500/20 rounded-lg p-3"
          >
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-200">{correctMoveMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint panel for move tasks and puzzles */}
      {(step.type === 'move_task' || step.type === 'puzzle') && (
        <HintPanel />
      )}
    </div>
  );
}

export function StepProgress() {
  const { steps, currentStepIndex } = useLearnStore();

  return (
    <div className="flex items-center gap-1">
      {steps.map((_, index) => (
        <div
          key={index}
          className={cn(
            'h-1.5 rounded-full transition-all',
            index < currentStepIndex
              ? 'bg-primary w-4'
              : index === currentStepIndex
                ? 'bg-primary/50 w-6'
                : 'bg-muted w-4'
          )}
        />
      ))}
    </div>
  );
}
