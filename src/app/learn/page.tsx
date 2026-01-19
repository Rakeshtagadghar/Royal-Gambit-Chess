'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrackCard, PracticePackCard, StreakDisplay } from '@/components/learn';
import {
  LearnTrackWithProgress,
  LearnPracticePack,
  LearnUserStreak,
  LEVEL_LABELS,
  LEVEL_COLORS,
} from '@/types/learn';
import { useAuth } from '@/hooks/useAuth';
import { learnApi } from '@/lib/api/urls';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Target,
  TrendingUp,
  ChevronRight,
  Sparkles,
  GraduationCap,
} from 'lucide-react';

interface RecommendedLesson {
  lesson: {
    id: string;
    slug: string;
    title: string;
    topic: string;
    level: string;
    estimatedMinutes: number;
  };
  track: {
    id: string;
    slug: string;
    title: string;
  };
  status: string;
}

export default function LearnHubPage() {
  const { isAuthenticated } = useAuth();
  const [tracks, setTracks] = useState<LearnTrackWithProgress[]>([]);
  const [recommendedLesson, setRecommendedLesson] = useState<RecommendedLesson | null>(null);
  const [practicePacks, setPracticePacks] = useState<(LearnPracticePack & { puzzleCount?: number })[]>([]);
  const [streak, setStreak] = useState<LearnUserStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tracks');

  useEffect(() => {
    if (isAuthenticated) {
      loadLearnHub();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 text-center">
          <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Learn Chess</h1>
          <p className="text-muted-foreground mb-4">Sign in to access lessons and track your progress</p>
          <Button asChild>
            <Link href="/login?redirect=/learn">Sign In</Link>
          </Button>
        </main>
      </div>
    );
  }

  async function loadLearnHub() {
    setLoading(true);

    try {
      // Fetch all data in parallel
      const [tracksRes, packsRes, recommendedRes] = await Promise.all([
        fetch(learnApi.tracks()),
        fetch(learnApi.practicePacks()),
        fetch(learnApi.recommended()),
      ]);

      // Process tracks
      if (tracksRes.ok) {
        const { tracks: tracksData } = await tracksRes.json();
        setTracks(tracksData || []);
      }

      // Process practice packs
      if (packsRes.ok) {
        const { packs: packsData } = await packsRes.json();
        setPracticePacks(packsData || []);
      }

      // Process recommended lesson
      if (recommendedRes.ok) {
        const { recommendation } = await recommendedRes.json();
        setRecommendedLesson(recommendation);
      }

      // Fetch progress/streak if authenticated
      if (isAuthenticated) {
        const progressRes = await fetch(learnApi.progress());
        if (progressRes.ok) {
          const progressData = await progressRes.json();
          if (progressData.streak) {
            setStreak({
              id: progressData.streak.id,
              userId: '',
              currentStreak: progressData.streak.currentStreak,
              longestStreak: progressData.streak.longestStreak,
              lastActivityDate: progressData.streak.lastActivityDate,
              updatedAt: '',
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading learn hub:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <GraduationCap className="w-8 h-8 text-primary" />
                Learn Chess
              </h1>
              <p className="text-muted-foreground mt-1">
                Master chess from beginner to expert with interactive lessons and puzzles
              </p>
            </div>

            {isAuthenticated && (
              <Link href="/learn/progress">
                <Button variant="outline" className="gap-2">
                  <TrendingUp className="w-4 h-4" />
                  View Progress
                </Button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Recommended Next & Streak */}
        {(recommendedLesson || streak) && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {recommendedLesson && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <CardTitle className="text-sm font-medium text-primary">
                        Recommended Next
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/learn/lesson/${recommendedLesson.lesson.slug}`}>
                      <div className="flex items-center justify-between group cursor-pointer">
                        <div>
                          <h3 className="font-semibold group-hover:text-primary transition-colors">
                            {recommendedLesson.lesson.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {recommendedLesson.lesson.estimatedMinutes} min
                          </p>
                        </div>
                        <Button size="sm" className="gap-2">
                          {recommendedLesson.status === 'in_progress'
                            ? 'Continue'
                            : 'Start'}
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {streak && isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <StreakDisplay
                  currentStreak={streak.currentStreak}
                  longestStreak={streak.longestStreak}
                />
              </motion.div>
            )}
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="tracks" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Learning Tracks
            </TabsTrigger>
            <TabsTrigger value="practice" className="gap-2">
              <Target className="w-4 h-4" />
              Practice
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tracks">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded w-20 mb-4" />
                      <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted rounded w-full mb-4" />
                      <div className="h-2 bg-muted rounded w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : tracks.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {tracks.map((track, index) => (
                  <TrackCard key={track.id} track={track} index={index} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tracks available yet</h3>
                  <p className="text-muted-foreground">
                    Learning tracks are coming soon. Check back later!
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Level Descriptions */}
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-4">Learning Path</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(['beginner', 'intermediate', 'advanced', 'expert'] as const).map(
                  (level, index) => (
                    <motion.div
                      key={level}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card>
                        <CardContent className="p-4">
                          <Badge
                            variant="outline"
                            className={cn('mb-2', LEVEL_COLORS[level])}
                          >
                            {LEVEL_LABELS[level]}
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            {getLevelDescription(level)}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="practice">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded w-20 mb-4" />
                      <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                      <div className="h-2 bg-muted rounded w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : practicePacks.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {practicePacks.map((pack, index) => (
                  <PracticePackCard key={pack.id} pack={pack} index={index} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No practice packs yet</h3>
                  <p className="text-muted-foreground">
                    Practice packs are coming soon. Check back later!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function getLevelDescription(level: string): string {
  switch (level) {
    case 'beginner':
      return 'Learn the rules, piece movements, and basic checkmate patterns.';
    case 'intermediate':
      return 'Master opening principles, tactical motifs, and basic endgames.';
    case 'advanced':
      return 'Develop positional understanding, calculation skills, and complex endgames.';
    case 'expert':
      return 'Study deep strategy, advanced techniques, and master-level concepts.';
    default:
      return '';
  }
}
