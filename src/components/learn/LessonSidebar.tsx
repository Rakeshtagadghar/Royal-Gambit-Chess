'use client';

import { motion } from 'framer-motion';
import { useLearnStore } from '@/stores/learnStore';
import { cn } from '@/lib/utils';
import { Check, Circle, PlayCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const stepTypeLabels: Record<string, string> = {
  explain: 'Learn',
  move_task: 'Practice',
  quiz: 'Quiz',
  puzzle: 'Puzzle',
  model_line: 'Example',
};

const stepTypeIcons: Record<string, string> = {
  explain: '📖',
  move_task: '♟️',
  quiz: '❓',
  puzzle: '🧩',
  model_line: '📋',
};

export function LessonSidebar() {
  const { steps, currentStepIndex, goToStep } = useLearnStore();

  return (
    <div className="w-64 border-l bg-card/50">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Lesson Steps</h3>
        <p className="text-sm text-muted-foreground">
          {currentStepIndex + 1} of {steps.length}
        </p>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="p-2 space-y-1">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isLocked = index > currentStepIndex;

            return (
              <motion.button
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => !isLocked && goToStep(index)}
                disabled={isLocked}
                className={cn(
                  'w-full text-left p-3 rounded-lg transition-all',
                  'flex items-start gap-3',
                  isCurrent && 'bg-primary/10 border border-primary/20',
                  isCompleted && 'bg-green-500/5 hover:bg-green-500/10',
                  isLocked && 'opacity-50 cursor-not-allowed',
                  !isCurrent && !isCompleted && !isLocked && 'hover:bg-muted/50'
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {isCompleted ? (
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <PlayCircle className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                      <Circle className="w-3 h-3 text-muted-foreground/50" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{stepTypeIcons[step.type]}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {stepTypeLabels[step.type]}
                    </span>
                  </div>
                  {step.title && (
                    <p className="text-sm font-medium truncate mt-0.5">
                      {step.title}
                    </p>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
