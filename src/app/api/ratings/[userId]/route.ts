import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/ratings/[userId]
 * 
 * Fetch all ratings for a specific user.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const supabase = await createClient();

    // Fetch all ratings for this user
    const { data: ratings, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('user_id', userId)
      .order('mode');

    if (error) {
      console.error('Ratings fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 });
    }

    // Transform to camelCase
    const transformedRatings = (ratings || []).map((rating: Record<string, unknown>) => ({
      userId: rating.user_id,
      mode: rating.mode,
      elo: rating.elo,
      gamesPlayed: rating.games_played,
      wins: rating.wins,
      losses: rating.losses,
      draws: rating.draws,
      updatedAt: rating.updated_at,
    }));

    return NextResponse.json({ ratings: transformedRatings });
  } catch (error) {
    console.error('Ratings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

