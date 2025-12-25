import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: game, error } = await supabase
      .from('games')
      .select(
        `*,
         white:profiles!games_white_id_fkey(id, username, display_name, avatar_url),
         black:profiles!games_black_id_fkey(id, username, display_name, avatar_url),
         creator:profiles!games_created_by_fkey(id, username, display_name, avatar_url)`
      )
      .eq('id', gameId)
      .single();

    if (error || !game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    return NextResponse.json({ game });
  } catch (e) {
    console.error('Get game error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


