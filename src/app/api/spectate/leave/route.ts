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

    const userId = auth.user.id;

    const { error } = await supabase
      .from('game_spectators')
      .update({ is_active: false, left_at: new Date().toISOString() })
      .eq('game_id', gameId)
      .eq('user_id', userId);

    if (error) {
      console.error('spectate/leave error:', error);
      return NextResponse.json({ error: 'Failed to leave spectator mode' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('spectate/leave error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


