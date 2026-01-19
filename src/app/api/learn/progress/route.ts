import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/learn/progress
 *
 * Fetch user's overall learning progress, stats, streak, and achievements.
 * Requires authentication.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Fetch all progress data in parallel
    const [
      tracksResult,
      progressResult,
      practiceResult,
      streakResult,
      achievementsResult,
      allAchievementsResult,
    ] = await Promise.all([
      // Tracks
      supabase
        .from('learn_tracks')
        .select('*')
        .eq('is_published', true)
        .order('order_index'),

      // User progress
      supabase
        .from('learn_user_progress')
        .select('*')
        .eq('user_id', user.id),

      // Practice results
      supabase
        .from('learn_user_practice_results')
        .select('is_correct')
        .eq('user_id', user.id),

      // Streak
      supabase
        .from('learn_user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single(),

      // User achievements
      supabase
        .from('learn_user_achievements')
        .select('*, learn_achievements(*)')
        .eq('user_id', user.id),

      // All achievements
      supabase
        .from('learn_achievements')
        .select('*'),
    ]);

    const tracks = tracksResult.data || [];
    const progress = progressResult.data || [];
    const practiceResults = practiceResult.data || [];
    const streak = streakResult.data;
    const userAchievements = achievementsResult.data || [];
    const allAchievements = allAchievementsResult.data || [];

    // Build tracks with progress
    const tracksWithProgress = await Promise.all(
      tracks.map(async (track) => {
        const { data: lessons } = await supabase
          .from('learn_lessons')
          .select('id')
          .eq('track_id', track.id)
          .eq('is_published', true);

        const lessonIds = lessons?.map((l) => l.id) || [];
        const totalLessons = lessonIds.length;

        const trackProgress = progress.filter((p) => lessonIds.includes(p.lesson_id));
        const completedLessons = trackProgress.filter((p) => p.status === 'completed').length;
        const inProgressLessons = trackProgress.filter((p) => p.status === 'in_progress').length;

        return {
          id: track.id,
          slug: track.slug,
          title: track.title,
          level: track.level,
          description: track.description,
          coverImageUrl: track.cover_image_url,
          orderIndex: track.order_index,
          estimatedHours: track.estimated_hours,
          totalLessons,
          completedLessons,
          inProgressLessons,
          completionPercentage: totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0,
        };
      })
    );

    // Get recent lessons
    const recentProgress = progress
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);

    const recentLessonIds = recentProgress.map((p) => p.lesson_id);
    let recentLessons: Array<{
      id: string;
      slug: string;
      title: string;
      topic: string;
      level: string;
      estimatedMinutes: number;
      progress: { status: string; lastStepIndex: number } | null;
      isLocked: boolean;
    }> = [];

    if (recentLessonIds.length > 0) {
      const { data: lessonsData } = await supabase
        .from('learn_lessons')
        .select('*')
        .in('id', recentLessonIds);

      if (lessonsData) {
        const lessonMap = new Map(lessonsData.map((l) => [l.id, l]));
        recentLessons = recentProgress
          .map((p) => {
            const lesson = lessonMap.get(p.lesson_id);
            if (!lesson) return null;
            return {
              id: lesson.id,
              slug: lesson.slug,
              title: lesson.title,
              topic: lesson.topic,
              level: lesson.level,
              estimatedMinutes: lesson.estimated_minutes,
              progress: {
                status: p.status,
                lastStepIndex: p.last_step_index,
              },
              isLocked: false,
            };
          })
          .filter(Boolean) as typeof recentLessons;
      }
    }

    // Calculate stats
    const totalLessonsCompleted = progress.filter((p) => p.status === 'completed').length;
    const totalTimeSpentSeconds = progress.reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0);
    const totalPuzzlesSolved = practiceResults.length;
    const totalPuzzlesCorrect = practiceResults.filter((r) => r.is_correct).length;
    const puzzleAccuracy = totalPuzzlesSolved > 0
      ? Math.round((totalPuzzlesCorrect / totalPuzzlesSolved) * 100)
      : 0;

    // Transform achievements
    const transformedAchievements = userAchievements.map((ua) => ({
      id: ua.id,
      achievementId: ua.achievement_id,
      earnedAt: ua.earned_at,
      achievement: ua.learn_achievements ? {
        id: ua.learn_achievements.id,
        slug: ua.learn_achievements.slug,
        title: ua.learn_achievements.title,
        description: ua.learn_achievements.description,
        icon: ua.learn_achievements.icon,
        category: ua.learn_achievements.category,
      } : null,
    }));

    const transformedAllAchievements = allAchievements.map((a) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      description: a.description,
      icon: a.icon,
      category: a.category,
    }));

    return NextResponse.json({
      tracks: tracksWithProgress,
      recentLessons,
      streak: streak ? {
        id: streak.id,
        currentStreak: streak.current_streak,
        longestStreak: streak.longest_streak,
        lastActivityDate: streak.last_activity_date,
      } : null,
      achievements: transformedAchievements,
      allAchievements: transformedAllAchievements,
      stats: {
        totalLessonsCompleted,
        totalPuzzlesSolved,
        totalPuzzlesCorrect,
        puzzleAccuracy,
        totalTimeSpentMinutes: Math.round(totalTimeSpentSeconds / 60),
        currentStreak: streak?.current_streak || 0,
        longestStreak: streak?.longest_streak || 0,
      },
    });
  } catch (error) {
    console.error('Progress error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
