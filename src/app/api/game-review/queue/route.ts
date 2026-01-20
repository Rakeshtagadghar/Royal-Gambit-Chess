import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { game_id } = body;

    if (!game_id) {
      return NextResponse.json(
        { success: false, error: 'Missing game_id', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(game_id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid game ID format', code: 'INVALID_GAME_ID' },
        { status: 400 }
      );
    }

    // Use the database function to queue the analysis (idempotent)
    const { data, error } = await supabase.rpc('queue_game_analysis', {
      p_game_id: game_id,
    });

    if (error) {
      console.error('Error queuing game analysis:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to queue analysis', code: 'INTERNAL_ERROR' },
        { status: 500 }
      );
    }

    // The RPC function returns a JSON object
    const result = data as {
      success: boolean;
      status?: string;
      game_id?: string;
      queued_at?: string;
      message?: string;
      error?: string;
      code?: string;
    };

    if (!result.success) {
      const statusCode = result.code === 'UNAUTHORIZED' ? 401 :
                        result.code === 'FORBIDDEN' ? 403 :
                        result.code === 'GAME_NOT_FOUND' ? 404 :
                        result.code === 'GAME_NOT_FINISHED' ? 400 : 500;

      return NextResponse.json(
        { success: false, error: result.error, code: result.code },
        { status: statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      status: result.status,
      game_id: result.game_id,
      queued_at: result.queued_at,
      message: result.message,
    });

  } catch (error) {
    console.error('Queue game analysis error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
