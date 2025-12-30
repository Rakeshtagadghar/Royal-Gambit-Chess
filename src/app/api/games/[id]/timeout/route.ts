import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface TimeoutBody {
  result: '1-0' | '0-1';
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: gameId } = await params;
    if (!gameId) return NextResponse.json({ error: 'Missing game id' }, { status: 400 });

    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as TimeoutBody | null;
    const result = body?.result;
    if (result !== '1-0' && result !== '0-1') {
      return NextResponse.json({ error: 'Invalid result' }, { status: 400 });
    }

    const { data: game, error: fetchError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (fetchError || !game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const isParticipant = game.white_id === user.id || game.black_id === user.id;
    if (!isParticipant) {
      return NextResponse.json({ error: 'Not a participant' }, { status: 403 });
    }

    // If already finished, return current row (hydrated) to keep client in sync.
    if (game.status === 'finished') {
      const { data: hydrated } = await supabase
        .from('games')
        .select(
          `*,
           white:profiles!games_white_id_fkey(id, username, display_name, avatar_url),
           black:profiles!games_black_id_fkey(id, username, display_name, avatar_url),
           creator:profiles!games_created_by_fkey(id, username, display_name, avatar_url)`
        )
        .eq('id', gameId)
        .single();
      return NextResponse.json({ game: hydrated ?? game });
    }

    if (game.status !== 'active') {
      return NextResponse.json({ error: 'Game is not active' }, { status: 400 });
    }

    const { data: updated, error: updateError } = await supabase
      .from('games')
      .update({
        status: 'finished',
        result,
        termination: 'timeout',
        ended_at: new Date().toISOString(),
      })
      .eq('id', gameId)
      .select(
        `*,
         white:profiles!games_white_id_fkey(id, username, display_name, avatar_url),
         black:profiles!games_black_id_fkey(id, username, display_name, avatar_url),
         creator:profiles!games_created_by_fkey(id, username, display_name, avatar_url)`
      )
      .single();

    if (updateError) {
      console.error('Timeout update error:', updateError);
      return NextResponse.json({ error: 'Failed to mark timeout' }, { status: 500 });
    }

    // Process ratings for PvP games (best-effort; do not fail request).
    if (updated?.mode === 'pvp' && !updated?.ratings_processed) {
      const { error: ratingsError } = await supabase.rpc('process_game_ratings', { p_game_id: gameId });
      if (ratingsError) {
        console.error('Process ratings error:', ratingsError);
      }
    }

    return NextResponse.json({ game: updated });
  } catch (e) {
    console.error('Timeout error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


