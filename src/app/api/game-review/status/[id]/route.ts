import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: gameId } = await params;

    if (!gameId) {
      return NextResponse.json(
        { success: false, error: 'Missing gameId', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(gameId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid game ID format', code: 'INVALID_GAME_ID' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Use the database function to get analysis status
    const { data, error } = await supabase.rpc('get_analysis_status', {
      p_game_id: gameId,
    });

    if (error) {
      console.error('Error getting analysis status:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to get analysis status', code: 'INTERNAL_ERROR' },
        { status: 500 }
      );
    }

    // The RPC function returns a JSON object
    const result = data as {
      success?: boolean;
      game_id: string;
      status: string;
      progress?: {
        current_ply: number;
        total_plies: number;
        percentage: number;
      } | null;
      error?: string;
      code?: string;
    };

    // Handle error from RPC
    if (result.success === false) {
      const statusCode = result.code === 'GAME_NOT_FOUND' ? 404 :
                        result.code === 'FORBIDDEN' ? 403 : 500;

      return NextResponse.json(
        { success: false, error: result.error, code: result.code },
        { status: statusCode }
      );
    }

    return NextResponse.json({
      game_id: result.game_id,
      status: result.status,
      progress: result.progress || undefined,
    });

  } catch (error) {
    console.error('Get analysis status error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
