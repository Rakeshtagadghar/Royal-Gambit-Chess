import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

type SignalBody = {
  gameId: string;
  roomId: string;
  toUserId: string;
  signal: unknown;
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const admin = createAdminClient();

    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as Partial<SignalBody> | null;
    const gameId = body?.gameId;
    const roomId = body?.roomId;
    const toUserId = body?.toUserId;
    const signal = body?.signal;

    if (!gameId || !roomId || !toUserId || !signal) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userId = auth.user.id;

    const { data: game } = await admin
      .from('games')
      .select('id, mode, status, white_id, black_id')
      .eq('id', gameId)
      .maybeSingle();

    if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    if (game.mode !== 'pvp') return NextResponse.json({ error: 'RTC is only available for PvP games' }, { status: 400 });
    if (game.status !== 'active') return NextResponse.json({ error: 'Game is not active' }, { status: 400 });

    const isParticipant = game.white_id === userId || game.black_id === userId;
    if (!isParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: room } = await admin
      .from('rtc_rooms')
      .select('id, game_id')
      .eq('game_id', gameId)
      .maybeSingle();

    if (!room || room.id !== roomId) {
      return NextResponse.json({ error: 'RTC room mismatch' }, { status: 400 });
    }

    const channelName = `rtc:game:${gameId}`;
    const channel = admin.channel(channelName);

    const sentAt = new Date().toISOString();
    const payload = {
      roomId,
      gameId,
      fromUserId: userId,
      toUserId,
      signal,
      sentAt,
    };

    // Ephemeral broadcast. We explicitly subscribe first so server-side sends work reliably.
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Realtime subscribe timeout')), 2500);
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          clearTimeout(timeout);
          resolve();
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          clearTimeout(timeout);
          reject(new Error(`Realtime subscribe failed: ${status}`));
        }
      });
    });

    const res = await channel.send({
      type: 'broadcast',
      event: 'signal',
      payload,
    });

    admin.removeChannel(channel);

    if (res !== 'ok') {
      return NextResponse.json({ error: 'Failed to publish signaling message' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('rtc/signal error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


