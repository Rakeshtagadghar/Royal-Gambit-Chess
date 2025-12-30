import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

type RoomResponse = {
  room: { id: string; game_id: string; created_by: string; created_at: string } | null;
  role: 'player1' | 'player2' | 'spectator';
  opponentUserId: string | null;
  can_publish_signaling: boolean;
  is_initiator: boolean;
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const admin = createAdminClient();

    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as { gameId?: string } | null;
    const gameId = body?.gameId;
    if (!gameId) return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });

    const { data: game, error: gameError } = await admin
      .from('games')
      .select('id, mode, status, white_id, black_id')
      .eq('id', gameId)
      .single();

    if (gameError || !game) return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    if (game.mode !== 'pvp') return NextResponse.json({ error: 'RTC is only available for PvP games' }, { status: 400 });
    if (game.status !== 'active') return NextResponse.json({ error: 'RTC is only available for active games' }, { status: 400 });

    const userId = auth.user.id;
    const isWhite = game.white_id === userId;
    const isBlack = game.black_id === userId;

    const role: RoomResponse['role'] = isWhite ? 'player1' : isBlack ? 'player2' : 'spectator';
    const opponentUserId = isWhite ? game.black_id : isBlack ? game.white_id : null;
    const can_publish_signaling = role !== 'spectator';
    const is_initiator = isWhite; // deterministic: white initiates

    const { data: existingRoom } = await admin
      .from('rtc_rooms')
      .select('*')
      .eq('game_id', gameId)
      .maybeSingle();

    if (existingRoom) {
      return NextResponse.json({
        room: existingRoom,
        role,
        opponentUserId,
        can_publish_signaling,
        is_initiator,
      } satisfies RoomResponse);
    }

    if (!can_publish_signaling) {
      // Spectators can only fetch existing rooms.
      return NextResponse.json({
        room: null,
        role,
        opponentUserId: null,
        can_publish_signaling: false,
        is_initiator: false,
      } satisfies RoomResponse);
    }

    const { data: inserted, error: insertError } = await admin
      .from('rtc_rooms')
      .insert({ game_id: gameId, created_by: userId })
      .select('*')
      .single();

    if (insertError || !inserted) {
      // Possible race: someone else created it. Re-read.
      const { data: roomRetry } = await admin
        .from('rtc_rooms')
        .select('*')
        .eq('game_id', gameId)
        .maybeSingle();

      if (!roomRetry) {
        return NextResponse.json({ error: 'Failed to create RTC room' }, { status: 500 });
      }

      return NextResponse.json({
        room: roomRetry,
        role,
        opponentUserId,
        can_publish_signaling,
        is_initiator,
      } satisfies RoomResponse);
    }

    return NextResponse.json({
      room: inserted,
      role,
      opponentUserId,
      can_publish_signaling,
      is_initiator,
    } satisfies RoomResponse);
  } catch (e) {
    console.error('rtc/room error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


