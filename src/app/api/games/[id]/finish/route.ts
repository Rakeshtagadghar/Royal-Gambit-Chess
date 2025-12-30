import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/games/[id]/finish
 * 
 * Process ratings for a finished PvP game.
 * This endpoint calls the process_game_ratings database function
 * which handles ELO calculation, rating updates, and history recording.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: gameId } = await params;
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a participant in the game
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (game.white_id !== user.id && game.black_id !== user.id) {
      return NextResponse.json({ error: 'Not a participant' }, { status: 403 });
    }

    // Only process PvP games
    if (game.mode !== 'pvp') {
      return NextResponse.json({ error: 'Only PvP games have ratings' }, { status: 400 });
    }

    // Only process finished games
    if (game.status !== 'finished') {
      return NextResponse.json({ error: 'Game not finished' }, { status: 400 });
    }

    // Check if already processed
    if (game.ratings_processed) {
      return NextResponse.json({ 
        message: 'Ratings already processed',
        alreadyProcessed: true 
      });
    }

    // Call the database function to process ratings
    const { data: result, error: processError } = await supabase
      .rpc('process_game_ratings', { p_game_id: gameId });

    if (processError) {
      console.error('Process ratings error:', processError);
      return NextResponse.json({ error: 'Failed to process ratings' }, { status: 500 });
    }

    if (result?.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      whiteDelta: result.white_delta,
      blackDelta: result.black_delta,
      whiteNewElo: result.white_new_elo,
      blackNewElo: result.black_new_elo,
    });
  } catch (error) {
    console.error('Finish game error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

