'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LessonBoard,
  StepContent,
  StepProgress,
  LessonNavigation,
} from '@/components/learn';
import { useLearnStore } from '@/stores/learnStore';
import { useAuth } from '@/hooks/useAuth';
import {
  LearnLesson,
  LearnLessonStep,
  LearnTrack,
  LEVEL_LABELS,
  LEVEL_COLORS,
  TOPIC_LABELS,
} from '@/types/learn';
import { learnApi } from '@/lib/api/urls';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Clock, List } from 'lucide-react';

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const lessonSlug = params.lessonSlug as string;

  const [lesson, setLesson] = useState<LearnLesson | null>(null);
  const [track, setTrack] = useState<LearnTrack | null>(null);
  const [nextLesson, setNextLesson] = useState<LearnLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const { user } = useAuth();
  const {
    steps,
    currentStepIndex,
    initLesson,
    goToStep,
    hintsUsed,
    attempts,
    getTimeSpent,
    reset,
  } = useLearnStore();

  useEffect(() => {
    loadLesson();
    return () => reset();
  }, [lessonSlug]);

  async function loadLesson() {
    setLoading(true);

    try {
      const response = await fetch(learnApi.lesson(lessonSlug));

      if (!response.ok) {
        router.push('/learn');
        return;
      }

      const data = await response.json();

      if (!data.lesson) {
        router.push('/learn');
        return;
      }

      const lessonObj = data.lesson as LearnLesson;
      setLesson(lessonObj);
      setTrack(data.track || null);
      setNextLesson(data.nextLesson || null);

      // Initialize the lesson in the store
      initLesson(lessonObj, data.steps || [], data.progress);
    } catch (error) {
      console.error('Error loading lesson:', error);
      router.push('/learn');
    } finally {
      setLoading(false);
    }
  }

  const saveProgress = useCallback(
    async (completed: boolean = false) => {
      if (!lesson) return;

      setSaving(true);

      try {
        const progressData = {
          lessonId: lesson.id,
          status: completed ? 'completed' : 'in_progress',
          lastStepIndex: currentStepIndex,
          attempts: attempts,
          hintsUsed: hintsUsed,
          timeSpentSeconds: getTimeSpent(),
          completedAt: completed ? new Date().toISOString() : null,
        };

        await fetch(learnApi.saveProgress(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(progressData),
        });
      } catch (error) {
        console.error('Error saving progress:', error);
      } finally {
        setSaving(false);
      }
    },
    [lesson, currentStepIndex, attempts, hintsUsed, getTimeSpent]
  );

  const handleComplete = useCallback(async () => {
    await saveProgress(true);

    if (nextLesson) {
      router.push(`/learn/lesson/${nextLesson.slug}`);
    } else if (track) {
      router.push(`/learn/track/${track.slug}`);
    } else {
      router.push('/learn');
    }
  }, [saveProgress, nextLesson, track, router]);

  // Auto-save progress periodically
  useEffect(() => {
    if (!user || !lesson || loading) return;

    const interval = setInterval(() => {
      saveProgress(false);
    }, 30000); // Save every 30 seconds

    return () => clearInterval(interval);
  }, [user, lesson, loading, saveProgress]);

  // Save on step change
  useEffect(() => {
    if (!loading && user && lesson) {
      saveProgress(false);
    }
  }, [currentStepIndex]);

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
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  const currentStep = steps[currentStepIndex];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Lesson Header */}
      <div className="border-b bg-card/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {track && (
                <Link href={`/learn/track/${track.slug}`}>
                  <Button variant="ghost" size="sm" className="gap-1 -ml-2">
                    <ChevronLeft className="w-4 h-4" />
                    {track.title}
                  </Button>
                </Link>
              )}
              <div className="hidden sm:flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn('text-xs', LEVEL_COLORS[lesson.level])}
                >
                  {LEVEL_LABELS[lesson.level]}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {TOPIC_LABELS[lesson.topic]}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{lesson.estimatedMinutes} min</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <h1 className="text-lg font-semibold mt-2">{lesson.title}</h1>
          <StepProgress />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Board Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center"
            >
              <LessonBoard interactive={true} />
            </motion.div>

            {/* Content Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <Card className="flex-1 py-0">
                <CardContent className="p-4">
                  <ScrollArea className="h-[450px] pr-4">
                    <StepContent />
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>

        {/* Sidebar (Mobile) */}
        {showSidebar && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-y-0 right-0 w-72 bg-card border-l shadow-xl z-50 lg:hidden"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Steps</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(false)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <ScrollArea className="h-[calc(100vh-60px)]">
              <div className="p-2 space-y-1">
                {steps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => {
                      goToStep(index);
                      setShowSidebar(false);
                    }}
                    className={cn(
                      'w-full text-left p-3 rounded-lg transition-all text-sm',
                      index === currentStepIndex && 'bg-primary/10 border border-primary/20',
                      index < currentStepIndex && 'text-muted-foreground',
                      index > currentStepIndex && 'opacity-50'
                    )}
                  >
                    <span className="text-muted-foreground mr-2">{index + 1}.</span>
                    {step.title || `Step ${index + 1}`}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </div>

      {/* Navigation Footer */}
      <LessonNavigation onComplete={handleComplete} />

      {/* Saving indicator */}
      {saving && (
        <div className="fixed bottom-20 right-4 bg-card border rounded-lg px-3 py-2 text-sm shadow-lg">
          Saving progress...
        </div>
      )}
    </div>
  );
}
