import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since'); // ISO string
    const baseMs = searchParams.get('baseMs');
    const incrementMs = searchParams.get('incrementMs');

    let query = supabase
      .from('games')
      .select('id, status, created_at, started_at, time_control, white_id, black_id')
      .eq('status', 'active')
      .or(`white_id.eq.${user.id},black_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (since) {
      query = query.gte('created_at', since);
    }

    if (baseMs && incrementMs) {
      query = query
        .eq('time_control->>baseMs', baseMs)
        .eq('time_control->>incrementMs', incrementMs);
    }

    const { data: games, error } = await query;

    if (error) {
      console.error('Ongoing game query error:', error);
      return NextResponse.json({ error: 'Failed to fetch ongoing game' }, { status: 500 });
    }

    const game = games?.[0];
    if (!game) return NextResponse.json({ ok: true, gameId: null });

    return NextResponse.json({ ok: true, gameId: game.id });
  } catch (e) {
    console.error('Ongoing game error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


