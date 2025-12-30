import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as { gameId?: string } | null;
    const gameId = body?.gameId;
    if (!gameId) return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });

    // Ensure the game is spectatable and the user isn't a participant.
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('id, mode, status, spectate_allowed, white_id, black_id')
      .eq('id', gameId)
      .single();

    if (gameError || !game) return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    if (game.mode !== 'pvp') return NextResponse.json({ error: 'Only PvP games can be spectated' }, { status: 400 });
    if (game.status !== 'active') return NextResponse.json({ error: 'Only active games can be spectated' }, { status: 400 });
    if (!game.spectate_allowed) return NextResponse.json({ error: 'Spectating disabled for this game' }, { status: 403 });

    const userId = auth.user.id;
    const isParticipant = game.white_id === userId || game.black_id === userId;
    if (isParticipant) {
      return NextResponse.json({ ok: true, spectator: null });
    }

    const { data: spectator, error } = await supabase
      .from('game_spectators')
      .upsert(
        {
          game_id: gameId,
          user_id: userId,
          is_active: true,
          left_at: null,
          joined_at: new Date().toISOString(),
        },
        { onConflict: 'game_id,user_id' }
      )
      .select('*')
      .single();

    if (error) {
      console.error('spectate/join error:', error);
      return NextResponse.json({ error: 'Failed to join as spectator' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, spectator });
  } catch (e) {
    console.error('spectate/join error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


