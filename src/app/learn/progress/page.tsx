'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrackCard,
  LessonCard,
  ProgressStats,
  StreakDisplay,
  AchievementGrid,
} from '@/components/learn';
import {
  LearnTrackWithProgress,
  LearnLessonWithProgress,
  LearnUserStreak,
  LearnUserAchievement,
  LearnAchievement,
  LearnProgressData,
} from '@/types/learn';
import { useAuth } from '@/hooks/useAuth';
import { learnApi } from '@/lib/api/urls';
import { ChevronLeft, TrendingUp, Trophy, BookOpen, Target } from 'lucide-react';

export default function ProgressPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuth();

  const [tracks, setTracks] = useState<LearnTrackWithProgress[]>([]);
  const [recentLessons, setRecentLessons] = useState<LearnLessonWithProgress[]>([]);
  const [streak, setStreak] = useState<LearnUserStreak | null>(null);
  const [achievements, setAchievements] = useState<(LearnUserAchievement & { achievement: LearnAchievement })[]>([]);
  const [allAchievements, setAllAchievements] = useState<LearnAchievement[]>([]);
  const [stats, setStats] = useState<LearnProgressData['stats']>({
    totalLessonsCompleted: 0,
    totalPuzzlesSolved: 0,
    totalPuzzlesCorrect: 0,
    puzzleAccuracy: 0,
    totalTimeSpentMinutes: 0,
    currentStreak: 0,
    longestStreak: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login?redirect=/learn/progress');
    }
  }, [isInitialized, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      loadProgress();
    }
  }, [user]);

  async function loadProgress() {
    if (!user) return;

    setLoading(true);

    try {
      const response = await fetch(learnApi.progress());

      if (!response.ok) {
        console.error('Error loading progress:', response.statusText);
        setLoading(false);
        return;
      }

      const data = await response.json();

      setTracks(data.tracks || []);
      setRecentLessons(data.recentLessons || []);
      setStreak(data.streak || null);
      setAchievements(data.achievements || []);
      setAllAchievements(data.allAchievements || []);
      setStats(data.stats || {
        totalLessonsCompleted: 0,
        totalPuzzlesSolved: 0,
        totalPuzzlesCorrect: 0,
        puzzleAccuracy: 0,
        totalTimeSpentMinutes: 0,
        currentStreak: 0,
        longestStreak: 0,
      });
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  }
  // Show skeleton only when auth is not yet initialized and we don't have a user
  if (!isInitialized && !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="grid grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-24 bg-muted rounded" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

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

          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-primary" />
            Your Progress
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your learning journey and achievements
          </p>
        </motion.div>

        {loading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-12 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Overview */}
            <ProgressStats stats={stats} />

            {/* Streak */}
            {streak && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="max-w-md"
              >
                <StreakDisplay
                  currentStreak={streak.currentStreak}
                  longestStreak={streak.longestStreak}
                />
              </motion.div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="tracks">
              <TabsList>
                <TabsTrigger value="tracks" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  Tracks
                </TabsTrigger>
                <TabsTrigger value="recent" className="gap-2">
                  <Target className="w-4 h-4" />
                  Recent
                </TabsTrigger>
                <TabsTrigger value="achievements" className="gap-2">
                  <Trophy className="w-4 h-4" />
                  Achievements
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tracks" className="mt-6">
                {tracks.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {tracks.map((track, index) => (
                      <TrackCard key={track.id} track={track} index={index} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No tracks started yet</p>
                      <Link href="/learn" className="mt-4 inline-block">
                        <Button>Start Learning</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="recent" className="mt-6">
                {recentLessons.length > 0 ? (
                  <div className="space-y-3 max-w-2xl">
                    {recentLessons.map((lesson, index) => (
                      <LessonCard
                        key={lesson.id}
                        lesson={lesson}
                        index={index}
                        showLevel
                      />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No recent activity</p>
                      <Link href="/learn" className="mt-4 inline-block">
                        <Button>Start a Lesson</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="achievements" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AchievementGrid
                      achievements={achievements}
                      allAchievements={allAchievements}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}
