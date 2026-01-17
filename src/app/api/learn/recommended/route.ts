import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/learn/recommended
 *
 * Get the recommended next lesson for the user.
 * Returns the first incomplete lesson in the first incomplete track.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user (optional - returns first beginner lesson if not authenticated)
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch tracks ordered by level
    const { data: tracks, error: tracksError } = await supabase
      .from('learn_tracks')
      .select('*')
      .eq('is_published', true)
      .order('order_index');

    if (tracksError || !tracks || tracks.length === 0) {
      return NextResponse.json({ recommendation: null });
    }

    // If not authenticated, return first lesson of first track
    if (!user) {
      const { data: firstLesson } = await supabase
        .from('learn_lessons')
        .select('*')
        .eq('track_id', tracks[0].id)
        .eq('is_published', true)
        .order('order_index')
        .limit(1)
        .single();

      if (firstLesson) {
        return NextResponse.json({
          recommendation: {
            lesson: {
              id: firstLesson.id,
              slug: firstLesson.slug,
              title: firstLesson.title,
              topic: firstLesson.topic,
              level: firstLesson.level,
              estimatedMinutes: firstLesson.estimated_minutes,
            },
            track: {
              id: tracks[0].id,
              slug: tracks[0].slug,
              title: tracks[0].title,
            },
            status: 'not_started',
          },
        });
      }
      return NextResponse.json({ recommendation: null });
    }

    // Find first incomplete track
    for (const track of tracks) {
      const { data: lessons } = await supabase
        .from('learn_lessons')
        .select('*')
        .eq('track_id', track.id)
        .eq('is_published', true)
        .order('order_index');

      if (!lessons || lessons.length === 0) continue;

      const lessonIds = lessons.map((l) => l.id);
      const { data: progress } = await supabase
        .from('learn_user_progress')
        .select('lesson_id, status, last_step_index')
        .eq('user_id', user.id)
        .in('lesson_id', lessonIds);

      const progressMap = new Map(
        progress?.map((p) => [p.lesson_id, p]) || []
      );

      // Find first incomplete lesson
      for (const lesson of lessons) {
        const lessonProgress = progressMap.get(lesson.id);

        if (!lessonProgress || lessonProgress.status !== 'completed') {
          return NextResponse.json({
            recommendation: {
              lesson: {
                id: lesson.id,
                slug: lesson.slug,
                title: lesson.title,
                topic: lesson.topic,
                level: lesson.level,
                estimatedMinutes: lesson.estimated_minutes,
              },
              track: {
                id: track.id,
                slug: track.slug,
                title: track.title,
              },
              status: lessonProgress?.status || 'not_started',
              lastStepIndex: lessonProgress?.last_step_index,
            },
          });
        }
      }
    }

    // All lessons completed
    return NextResponse.json({ recommendation: null });
  } catch (error) {
    console.error('Recommended lesson error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
