import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 50);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ongoing_games_view')
      .select('*')
      .order('started_at', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('ongoing games error:', error);
      return NextResponse.json({ error: 'Failed to load ongoing games' }, { status: 500 });
    }

    return NextResponse.json({ games: data ?? [], limit, offset });
  } catch (e) {
    console.error('ongoing games error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


