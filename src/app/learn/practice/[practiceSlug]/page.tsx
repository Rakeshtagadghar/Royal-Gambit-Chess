'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LessonBoard } from '@/components/learn';
import { useLearnStore, usePracticeStore } from '@/stores/learnStore';
import {
  LearnPracticePack,
  LEVEL_LABELS,
  LEVEL_COLORS,
  TOPIC_LABELS,
} from '@/types/learn';
import { learnApi } from '@/lib/api/urls';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  Target,
  CheckCircle2,
  XCircle,
  Lightbulb,
  RotateCcw,
  ChevronRight,
  Trophy,
} from 'lucide-react';

export default function PracticePackPage() {
  const params = useParams();
  const router = useRouter();
  const practiceSlug = params.practiceSlug as string;

  const [pack, setPack] = useState<LearnPracticePack | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  const {
    stepCompleted,
    correctMoveMessage,
    wrongMoveMessage,
    hintsUsed,
    attempts,
    initPuzzle,
    showHint,
    revealSolution,
    resetStep,
    currentPuzzle,
  } = useLearnStore();

  const {
    puzzles,
    currentPuzzleIndex,
    results,
    initPractice,
    recordResult,
    nextPuzzle,
    getStats,
    reset: resetPractice,
  } = usePracticeStore();

  useEffect(() => {
    loadPracticePack();
    return () => resetPractice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practiceSlug]);

  async function loadPracticePack() {
    setLoading(true);

    try {
      const response = await fetch(learnApi.practicePack(practiceSlug));

      if (!response.ok) {
        router.push('/learn');
        return;
      }

      const data = await response.json();

      if (!data.pack) {
        router.push('/learn');
        return;
      }

      setPack(data.pack);

      const sortedPuzzles = data.puzzles || [];
      initPractice(sortedPuzzles);

      // Start first puzzle
      if (sortedPuzzles.length > 0) {
        initPuzzle(sortedPuzzles[0]);
        setStartTime(Date.now());
      }
    } catch (error) {
      console.error('Error loading practice pack:', error);
      router.push('/learn');
    } finally {
      setLoading(false);
    }
  }

  // Handle puzzle completion
  useEffect(() => {
    if (stepCompleted && currentPuzzle) {
      const timeMs = Date.now() - startTime;
      recordResult(attempts === 0, attempts + 1, timeMs);

      // Save result to database via API
      saveResult(currentPuzzle.id, attempts === 0, attempts + 1, timeMs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepCompleted]);

  async function saveResult(
    puzzleId: string,
    isCorrect: boolean,
    attemptCount: number,
    timeMs: number
  ) {
    try {
      await fetch(learnApi.savePuzzleResult(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          puzzleId,
          isCorrect,
          attempts: attemptCount,
          timeMs,
          hintsUsed,
        }),
      });
    } catch (error) {
      console.error('Error saving result:', error);
    }
  }

  const handleNextPuzzle = useCallback(() => {
    if (currentPuzzleIndex < puzzles.length - 1) {
      nextPuzzle();
      const nextPuzzleObj = puzzles[currentPuzzleIndex + 1];
      initPuzzle(nextPuzzleObj);
      setStartTime(Date.now());
    } else {
      setShowResults(true);
    }
  }, [currentPuzzleIndex, puzzles, nextPuzzle, initPuzzle]);

  const handleRetry = useCallback(() => {
    resetPractice();
    initPractice(puzzles);
    if (puzzles.length > 0) {
      initPuzzle(puzzles[0]);
      setStartTime(Date.now());
    }
    setShowResults(false);
  }, [puzzles, resetPractice, initPractice, initPuzzle]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-muted rounded" />
              <div className="space-y-4">
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!pack) {
    return null;
  }

  const stats = getStats();
  const currentPuzzleNum = currentPuzzleIndex + 1;
  const totalPuzzles = puzzles.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/learn">
            <Button variant="ghost" className="gap-2 -ml-2 mb-4">
              <ChevronLeft className="w-4 h-4" />
              Back to Learn
            </Button>
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className={cn('text-sm', LEVEL_COLORS[pack.level])}
                >
                  {LEVEL_LABELS[pack.level]}
                </Badge>
                <Badge variant="secondary">{TOPIC_LABELS[pack.topic]}</Badge>
              </div>
              <h1 className="text-2xl font-bold">{pack.title}</h1>
              {pack.description && (
                <p className="text-muted-foreground mt-1">{pack.description}</p>
              )}
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold">
                {currentPuzzleNum}/{totalPuzzles}
              </div>
              <div className="text-sm text-muted-foreground">Puzzles</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentPuzzleNum / totalPuzzles) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Results Screen */}
        <AnimatePresence mode="wait">
          {showResults ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-lg mx-auto"
            >
              <Card>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Practice Complete!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold">{stats.total}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-green-500">
                        {stats.correct}
                      </div>
                      <div className="text-sm text-muted-foreground">Correct</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold">{stats.accuracy}%</div>
                      <div className="text-sm text-muted-foreground">Accuracy</div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleRetry}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                    <Link href="/learn" className="flex-1">
                      <Button className="w-full">
                        Done
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="practice"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto"
            >
              {/* Board */}
              <div className="flex justify-center">
                <LessonBoard interactive={!stepCompleted} />
              </div>

              {/* Controls */}
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="w-5 h-5 text-primary" />
                      <span className="font-semibold">
                        Puzzle {currentPuzzleNum} of {totalPuzzles}
                      </span>
                    </div>

                    <p className="text-muted-foreground mb-4">
                      Find the best move for{' '}
                      {currentPuzzle?.initialFen?.includes(' w ') ? 'White' : 'Black'}
                    </p>

                    {/* Feedback */}
                    <AnimatePresence mode="wait">
                      {wrongMoveMessage && !stepCompleted && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4"
                        >
                          <div className="flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-200">
                              {wrongMoveMessage}
                            </span>
                          </div>
                        </motion.div>
                      )}

                      {stepCompleted && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-200">
                              {correctMoveMessage || 'Correct!'}
                            </span>
                          </div>
                          {currentPuzzle?.explanationMd && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {currentPuzzle.explanationMd}
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2">
                      {!stepCompleted && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={showHint}
                            className="gap-2"
                          >
                            <Lightbulb className="w-4 h-4" />
                            Hint
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={revealSolution}
                            className="gap-2 text-muted-foreground"
                          >
                            Show Solution
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetStep}
                            className="gap-2"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Reset
                          </Button>
                        </>
                      )}

                      {stepCompleted && (
                        <Button onClick={handleNextPuzzle} className="gap-2 w-full">
                          {currentPuzzleIndex < puzzles.length - 1 ? (
                            <>
                              Next Puzzle
                              <ChevronRight className="w-4 h-4" />
                            </>
                          ) : (
                            'View Results'
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Stats */}
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <div className="font-semibold text-green-500">
                          {results.filter((r) => r.correct).length}
                        </div>
                        <div className="text-muted-foreground">Correct</div>
                      </div>
                      <div>
                        <div className="font-semibold text-red-500">
                          {results.filter((r) => !r.correct).length}
                        </div>
                        <div className="text-muted-foreground">Wrong</div>
                      </div>
                      <div>
                        <div className="font-semibold">{stats.accuracy}%</div>
                        <div className="text-muted-foreground">Accuracy</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
