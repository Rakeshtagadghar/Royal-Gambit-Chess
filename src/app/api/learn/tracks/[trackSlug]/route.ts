import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ trackSlug: string }>;
}

/**
 * GET /api/learn/tracks/[trackSlug]
 *
 * Fetch a single track with its lessons and user progress.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { trackSlug } = await params;
    const supabase = await createClient();

    // Get current user (optional)
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch track
    const { data: track, error: trackError } = await supabase
      .from('learn_tracks')
      .select('*')
      .eq('slug', trackSlug)
      .eq('is_published', true)
      .single();

    if (trackError || !track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    // Fetch lessons for this track
    const { data: lessons, error: lessonsError } = await supabase
      .from('learn_lessons')
      .select('*')
      .eq('track_id', track.id)
      .eq('is_published', true)
      .order('order_index');

    if (lessonsError) {
      console.error('Lessons fetch error:', lessonsError);
      return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
    }

    // Get user progress if authenticated
    let progressMap = new Map<string, { status: string; lastStepIndex: number }>();
    let completedLessonIds = new Set<string>();

    if (user && lessons && lessons.length > 0) {
      const lessonIds = lessons.map((l) => l.id);
      const { data: progressData } = await supabase
        .from('learn_user_progress')
        .select('lesson_id, status, last_step_index')
        .eq('user_id', user.id)
        .in('lesson_id', lessonIds);

      if (progressData) {
        progressData.forEach((p) => {
          progressMap.set(p.lesson_id, {
            status: p.status,
            lastStepIndex: p.last_step_index,
          });
          if (p.status === 'completed') {
            completedLessonIds.add(p.lesson_id);
          }
        });
      }
    }

    // Transform lessons with progress and lock status
    const lessonsWithProgress = (lessons || []).map((lesson) => {
      const progress = progressMap.get(lesson.id);
      const prerequisiteIds = lesson.prerequisite_lesson_ids || [];

      // Check if locked due to prerequisites
      const isLocked = prerequisiteIds.length > 0 &&
        !prerequisiteIds.every((prereqId: string) => completedLessonIds.has(prereqId));

      return {
        id: lesson.id,
        trackId: lesson.track_id,
        slug: lesson.slug,
        title: lesson.title,
        topic: lesson.topic,
        level: lesson.level,
        description: lesson.description,
        estimatedMinutes: lesson.estimated_minutes,
        orderIndex: lesson.order_index,
        prerequisiteLessonIds: prerequisiteIds,
        coverImageUrl: lesson.cover_image_url,
        isPublished: lesson.is_published,
        createdAt: lesson.created_at,
        updatedAt: lesson.updated_at,
        progress: progress ? {
          status: progress.status,
          lastStepIndex: progress.lastStepIndex,
        } : null,
        isLocked,
      };
    });

    // Calculate track progress
    const totalLessons = lessonsWithProgress.length;
    const completedLessons = lessonsWithProgress.filter((l) => l.progress?.status === 'completed').length;
    const inProgressLessons = lessonsWithProgress.filter((l) => l.progress?.status === 'in_progress').length;

    return NextResponse.json({
      track: {
        id: track.id,
        slug: track.slug,
        title: track.title,
        level: track.level,
        description: track.description,
        coverImageUrl: track.cover_image_url,
        orderIndex: track.order_index,
        estimatedHours: track.estimated_hours,
        isPublished: track.is_published,
        createdAt: track.created_at,
        updatedAt: track.updated_at,
      },
      lessons: lessonsWithProgress,
      progress: {
        totalLessons,
        completedLessons,
        inProgressLessons,
        completionPercentage: totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0,
      },
    });
  } catch (error) {
    console.error('Track detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
