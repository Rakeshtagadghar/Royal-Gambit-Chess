import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ensureProfileExists } from '@/lib/supabase/ensureProfile';

export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: gameId } = await context.params;
    if (!gameId) return NextResponse.json({ error: 'Missing game id' }, { status: 400 });

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureProfileExists(supabase, user);

    const { data: game, error: fetchError } = await supabase
      .from('games')
      .select('id, status, white_id, black_id, current_fen, pgn')
      .eq('id', gameId)
      .single();

    if (fetchError || !game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const isWhite = (game.white_id as string | null) === user.id;
    const isBlack = (game.black_id as string | null) === user.id;
    if (!isWhite && !isBlack) {
      return NextResponse.json({ error: 'You are not a participant in this game' }, { status: 403 });
    }

    if ((game.status as string) === 'finished') {
      // Already finished; return current row (hydrated) to the client.
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

    const result = isWhite ? '0-1' : '1-0';

    const { data: updated, error: updateError } = await supabase
      .from('games')
      .update({
        status: 'finished',
        result,
        termination: 'resign',
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
      console.error('Resign update error:', updateError);
      return NextResponse.json({ error: 'Failed to resign' }, { status: 500 });
    }

    return NextResponse.json({ game: updated });
  } catch (error) {
    console.error('Resign error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


