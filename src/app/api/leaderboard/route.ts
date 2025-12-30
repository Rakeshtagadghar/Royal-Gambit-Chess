import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Cache duration: 1 day in seconds
const CACHE_MAX_AGE = 86400; // 24 hours
const CACHE_STALE_WHILE_REVALIDATE = 3600; // 1 hour

/**
 * GET /api/leaderboard
 * 
 * Fetch leaderboard rankings.
 * Query params:
 *   - mode: 'bullet' | 'blitz' | 'rapid' | 'classical' (defaults to 'blitz')
 *   - limit: number (defaults to 100)
 * 
 * Cached for 1 day with stale-while-revalidate for better performance.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('mode') || 'blitz';
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);

    // Validate mode
    const validModes = ['bullet', 'blitz', 'rapid', 'classical'];
    if (!validModes.includes(mode)) {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch leaderboard from the view
    const { data: leaderboard, error } = await supabase
      .from('leaderboard_global')
      .select('*')
      .eq('mode', mode)
      .order('rank', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Leaderboard fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }

    // Transform to camelCase
    const transformedLeaderboard = (leaderboard || []).map((entry: Record<string, unknown>) => ({
      userId: entry.user_id,
      mode: entry.mode,
      elo: entry.elo,
      gamesPlayed: entry.games_played,
      wins: entry.wins,
      losses: entry.losses,
      draws: entry.draws,
      username: entry.username,
      displayName: entry.display_name,
      avatarUrl: entry.avatar_url,
      rank: entry.rank,
    }));

    // Return with cache headers (1 day cache)
    return NextResponse.json(
      { leaderboard: transformedLeaderboard },
      {
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_STALE_WHILE_REVALIDATE}`,
        },
      }
    );
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

