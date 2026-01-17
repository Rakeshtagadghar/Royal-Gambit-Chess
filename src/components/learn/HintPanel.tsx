'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLearnStore } from '@/stores/learnStore';
import { Lightbulb, Eye, RotateCcw } from 'lucide-react';

export function HintPanel() {
  const {
    steps,
    currentStepIndex,
    showingHint,
    currentHintIndex,
    hintsUsed,
    stepCompleted,
    showHint,
    revealSolution,
    resetStep,
  } = useLearnStore();

  const step = steps[currentStepIndex];
  const hints = step?.hints || [];
  const hasMoreHints = currentHintIndex < hints.length - 1;
  const canShowHint = hints.length > 0 && !stepCompleted;
  const canReveal =
    (step?.type === 'move_task' || step?.type === 'puzzle') && !stepCompleted;

  if (!canShowHint && !canReveal) return null;

  return (
    <div className="space-y-3">
      {/* Hint display */}
      <AnimatePresence mode="wait">
        {showingHint && currentHintIndex >= 0 && hints[currentHintIndex] && (
          <motion.div
            key={currentHintIndex}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3"
          >
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-yellow-200">
                  Hint {currentHintIndex + 1} of {hints.length}
                </p>
                <p className="text-sm mt-1">{hints[currentHintIndex]}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {canShowHint && hasMoreHints && (
          <Button
            variant="outline"
            size="sm"
            onClick={showHint}
            className="gap-2"
          >
            <Lightbulb className="w-4 h-4" />
            {currentHintIndex < 0 ? 'Get Hint' : 'Next Hint'}
          </Button>
        )}

        {canReveal && (
          <Button
            variant="outline"
            size="sm"
            onClick={revealSolution}
            className="gap-2 text-muted-foreground"
          >
            <Eye className="w-4 h-4" />
            Reveal Solution
          </Button>
        )}

        {!stepCompleted && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetStep}
            className="gap-2 text-muted-foreground"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        )}
      </div>

      {/* Hints used counter */}
      {hintsUsed > 0 && (
        <p className="text-xs text-muted-foreground">
          Hints used this lesson: {hintsUsed}
        </p>
      )}
    </div>
  );
}
