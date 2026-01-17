import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ lessonSlug: string }>;
}

/**
 * GET /api/learn/lessons/[lessonSlug]
 *
 * Fetch a lesson with its steps and user progress.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { lessonSlug } = await params;
    const supabase = await createClient();

    // Get current user (optional)
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('learn_lessons')
      .select('*')
      .eq('slug', lessonSlug)
      .eq('is_published', true)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Fetch track info
    let track = null;
    if (lesson.track_id) {
      const { data: trackData } = await supabase
        .from('learn_tracks')
        .select('id, slug, title, level')
        .eq('id', lesson.track_id)
        .single();
      track = trackData;
    }

    // Fetch next and previous lessons
    let nextLesson = null;
    let prevLesson = null;

    if (lesson.track_id) {
      // Next lesson
      const { data: nextData } = await supabase
        .from('learn_lessons')
        .select('id, slug, title')
        .eq('track_id', lesson.track_id)
        .eq('is_published', true)
        .gt('order_index', lesson.order_index)
        .order('order_index')
        .limit(1)
        .single();
      nextLesson = nextData;

      // Previous lesson
      const { data: prevData } = await supabase
        .from('learn_lessons')
        .select('id, slug, title')
        .eq('track_id', lesson.track_id)
        .eq('is_published', true)
        .lt('order_index', lesson.order_index)
        .order('order_index', { ascending: false })
        .limit(1)
        .single();
      prevLesson = prevData;
    }

    // Fetch steps
    const { data: steps, error: stepsError } = await supabase
      .from('learn_lesson_steps')
      .select('*')
      .eq('lesson_id', lesson.id)
      .order('step_index');

    if (stepsError) {
      console.error('Steps fetch error:', stepsError);
      return NextResponse.json({ error: 'Failed to fetch lesson steps' }, { status: 500 });
    }

    // Get user progress if authenticated
    let progress = null;
    if (user) {
      const { data: progressData } = await supabase
        .from('learn_user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lesson.id)
        .single();

      if (progressData) {
        progress = {
          id: progressData.id,
          userId: progressData.user_id,
          lessonId: progressData.lesson_id,
          status: progressData.status,
          lastStepIndex: progressData.last_step_index,
          attempts: progressData.attempts,
          hintsUsed: progressData.hints_used,
          bestScore: progressData.best_score,
          timeSpentSeconds: progressData.time_spent_seconds,
          completedAt: progressData.completed_at,
          updatedAt: progressData.updated_at,
        };
      }
    }

    // Transform steps
    const transformedSteps = (steps || []).map((step) => ({
      id: step.id,
      lessonId: step.lesson_id,
      stepIndex: step.step_index,
      type: step.type,
      title: step.title,
      bodyMd: step.body_md,
      initialFen: step.initial_fen,
      requiredMoveUci: step.required_move_uci,
      allowedMovesUci: step.allowed_moves_uci || [],
      solutionLineUci: step.solution_line_uci || [],
      hints: step.hints || [],
      explainCorrectMd: step.explain_correct_md,
      explainWrongMd: step.explain_wrong_md,
      meta: step.meta || {},
      createdAt: step.created_at,
    }));

    return NextResponse.json({
      lesson: {
        id: lesson.id,
        trackId: lesson.track_id,
        slug: lesson.slug,
        title: lesson.title,
        topic: lesson.topic,
        level: lesson.level,
        description: lesson.description,
        estimatedMinutes: lesson.estimated_minutes,
        orderIndex: lesson.order_index,
        prerequisiteLessonIds: lesson.prerequisite_lesson_ids || [],
        coverImageUrl: lesson.cover_image_url,
        isPublished: lesson.is_published,
        createdAt: lesson.created_at,
        updatedAt: lesson.updated_at,
      },
      steps: transformedSteps,
      progress,
      track: track ? {
        id: track.id,
        slug: track.slug,
        title: track.title,
        level: track.level,
      } : null,
      nextLesson: nextLesson ? {
        id: nextLesson.id,
        slug: nextLesson.slug,
        title: nextLesson.title,
      } : null,
      prevLesson: prevLesson ? {
        id: prevLesson.id,
        slug: prevLesson.slug,
        title: prevLesson.title,
      } : null,
    });
  } catch (error) {
    console.error('Lesson detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
