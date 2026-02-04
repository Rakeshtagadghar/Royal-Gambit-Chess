'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useLearnStore } from '@/stores/learnStore';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';


export function QuizCard() {
  const {
    steps,
    currentStepIndex,
    selectedQuizOption,
    quizAnswered,
    quizCorrect,
    selectQuizOption,
    submitQuizAnswer,
    resetQuiz,
  } = useLearnStore();


  const t = useTranslations('learn.lesson');
  const step = steps[currentStepIndex];
  const quiz = step?.meta?.quiz;

  if (!quiz || step?.type !== 'quiz') return null;

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold">{quiz.question}</h3>

      <div className="space-y-1.5">
        {quiz.options.map((option, index) => {
          const isSelected = selectedQuizOption === option.id;
          const isCorrect = option.id === quiz.correctOptionId;
          const showResult = quizAnswered;

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => !quizAnswered && selectQuizOption(option.id)}
              disabled={quizAnswered}
              className={cn(
                'w-full text-left px-3 py-2.5 rounded-lg border transition-all',
                'hover:bg-muted/50',
                isSelected && !showResult && 'border-primary bg-primary/10',
                showResult && isCorrect && 'border-green-500 bg-green-500/10',
                showResult && isSelected && !isCorrect && 'border-red-500 bg-red-500/10',
                !isSelected && !showResult && 'border-border',
                quizAnswered && 'cursor-default'
              )}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0',
                    'border',
                    isSelected && !showResult && 'bg-primary text-primary-foreground border-primary',
                    showResult && isCorrect && 'bg-green-500 text-white border-green-500',
                    showResult && isSelected && !isCorrect && 'bg-red-500 text-white border-red-500',
                    !isSelected && !showResult && 'bg-muted border-border'
                  )}
                >
                  {showResult && isCorrect ? (
                    <Check className="w-3 h-3" />
                  ) : showResult && isSelected && !isCorrect ? (
                    <X className="w-3 h-3" />
                  ) : (
                    String.fromCharCode(65 + index)
                  )}
                </span>
                <span className="text-sm">{option.text}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {!quizAnswered && (
        <Button
          onClick={submitQuizAnswer}
          disabled={!selectedQuizOption}
          className="w-full"
          size="sm"
        >
          {t('submitAnswer')}
        </Button>
      )}

      {quizAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'p-3 rounded-lg',
            quizCorrect ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
          )}
        >
          <div className="flex items-center gap-2">
            {quizCorrect ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span className="font-semibold text-green-500 text-sm">{t('correct')}</span>
              </>
            ) : (
              <>
                <X className="w-4 h-4 text-red-500" />
                <span className="font-semibold text-red-500 text-sm">{t('notQuite')}</span>
              </>
            )}
          </div>
          {quizCorrect && quiz.explainMd && (
            <p className="text-xs text-muted-foreground mt-1">{quiz.explainMd}</p>
          )}
        </motion.div>
      )}

      {quizAnswered && !quizCorrect && (
        <Button
          onClick={resetQuiz}
          variant="outline"
          className="w-full"
          size="sm"
        >
          {t('tryAgain')}
        </Button>
      )}
    </div>
  );
}
