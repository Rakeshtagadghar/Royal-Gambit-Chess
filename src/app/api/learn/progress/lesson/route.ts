import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/learn/progress/lesson
 *
 * Save or update user's lesson progress.
 * Requires authentication.
 *
 * Body:
 *   - lessonId: string
 *   - status: 'not_started' | 'in_progress' | 'completed'
 *   - lastStepIndex: number
 *   - attempts: number
 *   - hintsUsed: number
 *   - timeSpentSeconds: number
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      lessonId,
      status,
      lastStepIndex,
      attempts,
      hintsUsed,
      timeSpentSeconds,
    } = body;

    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId is required' }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['not_started', 'in_progress', 'completed'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Verify lesson exists
    const { data: lesson, error: lessonError } = await supabase
      .from('learn_lessons')
      .select('id')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Upsert progress
    const progressData: Record<string, unknown> = {
      user_id: user.id,
      lesson_id: lessonId,
    };

    if (status !== undefined) progressData.status = status;
    if (lastStepIndex !== undefined) progressData.last_step_index = lastStepIndex;
    if (attempts !== undefined) progressData.attempts = attempts;
    if (hintsUsed !== undefined) progressData.hints_used = hintsUsed;
    if (timeSpentSeconds !== undefined) progressData.time_spent_seconds = timeSpentSeconds;

    if (status === 'completed') {
      progressData.completed_at = new Date().toISOString();
    }

    const { data: progress, error: progressError } = await supabase
      .from('learn_user_progress')
      .upsert(progressData, {
        onConflict: 'user_id,lesson_id',
      })
      .select()
      .single();

    if (progressError) {
      console.error('Progress save error:', progressError);
      return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
    }

    // Update streak if lesson completed
    if (status === 'completed') {
      try {
        await supabase.rpc('update_learn_streak', { p_user_id: user.id });
      } catch (streakError) {
        console.error('Streak update error:', streakError);
        // Don't fail the request if streak update fails
      }
    }

    return NextResponse.json({
      success: true,
      progress: {
        id: progress.id,
        userId: progress.user_id,
        lessonId: progress.lesson_id,
        status: progress.status,
        lastStepIndex: progress.last_step_index,
        attempts: progress.attempts,
        hintsUsed: progress.hints_used,
        timeSpentSeconds: progress.time_spent_seconds,
        completedAt: progress.completed_at,
        updatedAt: progress.updated_at,
      },
    });
  } catch (error) {
    console.error('Progress save error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
