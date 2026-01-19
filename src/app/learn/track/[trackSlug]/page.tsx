'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LessonCard } from '@/components/learn';
import {
  LearnTrack,
  LearnLessonWithProgress,
  LEVEL_LABELS,
  LEVEL_COLORS,
} from '@/types/learn';
import { learnApi } from '@/lib/api/urls';
import { cn } from '@/lib/utils';
import { ChevronLeft, Clock, BookOpen, CheckCircle2 } from 'lucide-react';

export default function TrackPage() {
  const params = useParams();
  const router = useRouter();
  const trackSlug = params.trackSlug as string;

  const [track, setTrack] = useState<LearnTrack | null>(null);
  const [lessons, setLessons] = useState<LearnLessonWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({
    totalLessons: 0,
    completedLessons: 0,
    completionPercentage: 0,
  });

  useEffect(() => {
    loadTrack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackSlug]);

  async function loadTrack() {
    setLoading(true);

    try {
      const response = await fetch(learnApi.track(trackSlug));

      if (!response.ok) {
        router.push('/learn');
        return;
      }

      const data = await response.json();

      if (!data.track) {
        router.push('/learn');
        return;
      }

      setTrack(data.track);
      setLessons(data.lessons || []);
      setProgress({
        totalLessons: data.progress?.totalLessons || 0,
        completedLessons: data.progress?.completedLessons || 0,
        completionPercentage: data.progress?.completionPercentage || 0,
      });
    } catch (error) {
      console.error('Error loading track:', error);
      router.push('/learn');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-muted rounded" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!track) {
    return null;
  }

  const isCompleted = progress.completionPercentage === 100;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link href="/learn">
            <Button variant="ghost" className="gap-2 -ml-2">
              <ChevronLeft className="w-4 h-4" />
              Back to Learn
            </Button>
          </Link>
        </motion.div>

        {/* Track Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge
                  variant="outline"
                  className={cn('text-sm', LEVEL_COLORS[track.level])}
                >
                  {LEVEL_LABELS[track.level]}
                </Badge>
                {isCompleted && (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Completed
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold">{track.title}</h1>
              {track.description && (
                <p className="text-muted-foreground mt-2 max-w-2xl">
                  {track.description}
                </p>
              )}
            </div>
          </div>

          {/* Track Stats */}
          <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>{progress.totalLessons} lessons</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{track.estimatedHours} hours</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 max-w-md">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                {progress.completedLessons} of {progress.totalLessons} completed
              </span>
              <span className="font-medium">{progress.completionPercentage}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress.completionPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Lessons List */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold mb-4">Lessons</h2>
          {lessons.length > 0 ? (
            lessons.map((lesson, index) => (
              <LessonCard key={lesson.id} lesson={lesson} index={index} />
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No lessons yet</h3>
                <p className="text-muted-foreground">
                  Lessons for this track are coming soon!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
