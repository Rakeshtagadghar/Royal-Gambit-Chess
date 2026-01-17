import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/learn/progress/puzzle
 *
 * Save user's puzzle attempt result.
 * Requires authentication.
 *
 * Body:
 *   - puzzleId: string
 *   - isCorrect: boolean
 *   - attempts: number
 *   - timeMs: number (optional)
 *   - hintsUsed: number (optional)
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
      puzzleId,
      isCorrect,
      attempts,
      timeMs,
      hintsUsed,
    } = body;

    if (!puzzleId) {
      return NextResponse.json({ error: 'puzzleId is required' }, { status: 400 });
    }

    if (isCorrect === undefined) {
      return NextResponse.json({ error: 'isCorrect is required' }, { status: 400 });
    }

    // Verify puzzle exists
    const { data: puzzle, error: puzzleError } = await supabase
      .from('learn_puzzles')
      .select('id')
      .eq('id', puzzleId)
      .single();

    if (puzzleError || !puzzle) {
      return NextResponse.json({ error: 'Puzzle not found' }, { status: 404 });
    }

    // Insert result
    const resultData = {
      user_id: user.id,
      puzzle_id: puzzleId,
      is_correct: isCorrect,
      attempts: attempts || 1,
      time_ms: timeMs || null,
      hints_used: hintsUsed || 0,
    };

    const { data: result, error: resultError } = await supabase
      .from('learn_user_practice_results')
      .insert(resultData)
      .select()
      .single();

    if (resultError) {
      console.error('Result save error:', resultError);
      return NextResponse.json({ error: 'Failed to save result' }, { status: 500 });
    }

    // Update streak
    try {
      await supabase.rpc('update_learn_streak', { p_user_id: user.id });
    } catch (streakError) {
      console.error('Streak update error:', streakError);
      // Don't fail the request if streak update fails
    }

    return NextResponse.json({
      success: true,
      result: {
        id: result.id,
        puzzleId: result.puzzle_id,
        isCorrect: result.is_correct,
        attempts: result.attempts,
        timeMs: result.time_ms,
        hintsUsed: result.hints_used,
        createdAt: result.created_at,
      },
    });
  } catch (error) {
    console.error('Puzzle result save error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
