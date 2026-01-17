'use client';

import { Button } from '@/components/ui/button';
import { useLearnStore } from '@/stores/learnStore';
import { ChevronLeft, ChevronRight, RotateCcw, FlipVertical2 } from 'lucide-react';

interface LessonNavigationProps {
  onComplete?: () => void;
}

export function LessonNavigation({ onComplete }: LessonNavigationProps) {
  const {
    steps,
    currentStepIndex,
    stepCompleted,
    nextStep,
    prevStep,
    resetStep,
    flipBoard,
  } = useLearnStore();

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const currentStep = steps[currentStepIndex];

  // For explain steps, automatically mark as completed
  const canProceed =
    stepCompleted ||
    currentStep?.type === 'explain' ||
    currentStep?.type === 'model_line';

  const handleNext = () => {
    if (isLastStep && canProceed) {
      onComplete?.();
    } else if (canProceed) {
      nextStep();
    }
  };

  return (
    <div className="flex items-center justify-between border-t p-4 bg-card/50">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={flipBoard}
          title="Flip board"
        >
          <FlipVertical2 className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={resetStep}
          title="Reset position"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={isFirstStep}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className="gap-2"
        >
          {isLastStep ? 'Complete' : 'Next'}
          {!isLastStep && <ChevronRight className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
