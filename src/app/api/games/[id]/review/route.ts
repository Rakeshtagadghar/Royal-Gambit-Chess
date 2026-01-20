import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: gameId } = await params;
    const { searchParams } = new URL(request.url);
    const includeMoves = searchParams.get('include_moves') !== 'false';

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

    // Get current user (optional for public finished games)
    const { data: { user } } = await supabase.auth.getUser();

    // First check if the game exists and verify access
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('id, status, white_id, black_id')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      return NextResponse.json(
        { success: false, error: 'Game not found', code: 'GAME_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check access - finished games are public, otherwise user must be a participant
    if (game.status !== 'finished') {
      if (!user || (game.white_id !== user.id && game.black_id !== user.id)) {
        return NextResponse.json(
          { success: false, error: "You don't have access to this game", code: 'FORBIDDEN' },
          { status: 403 }
        );
      }
    }

    // Get game analysis
    const { data: analysis, error: analysisError } = await supabase
      .from('game_analysis')
      .select('*')
      .eq('game_id', gameId)
      .single();

    // No analysis found - return not_requested status
    if (analysisError?.code === 'PGRST116' || !analysis) {
      return NextResponse.json({
        status: 'not_requested',
        game_id: gameId,
        message: 'Analysis has not been requested for this game',
      });
    }

    if (analysisError) {
      console.error('Error fetching game analysis:', analysisError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch analysis', code: 'INTERNAL_ERROR' },
        { status: 500 }
      );
    }

    // Handle different statuses
    if (analysis.status === 'pending') {
      return NextResponse.json({
        status: 'pending',
        game_id: gameId,
        queued_at: analysis.queued_at,
      });
    }

    if (analysis.status === 'processing') {
      return NextResponse.json({
        status: 'processing',
        game_id: gameId,
        started_at: analysis.started_at,
        progress: analysis.total_plies > 0 ? {
          current_ply: analysis.current_ply,
          total_plies: analysis.total_plies,
          percentage: Math.round((analysis.current_ply / analysis.total_plies) * 100),
        } : undefined,
      });
    }

    if (analysis.status === 'failed') {
      return NextResponse.json({
        status: 'failed',
        game_id: gameId,
        error: analysis.error_message || 'Analysis failed',
      });
    }

    // Status is 'done' - return full analysis
    const response: Record<string, unknown> = {
      status: 'done',
      game_id: gameId,
      analysis: {
        engine_name: analysis.engine_name,
        engine_version: analysis.engine_version,
        analysis_depth: analysis.analysis_depth,
        time_per_move_ms: analysis.time_per_move_ms,
        completed_at: analysis.completed_at,
        white: {
          accuracy: parseFloat(analysis.white_accuracy) || 0,
          acpl: parseFloat(analysis.white_acpl) || 0,
          blunders: analysis.white_blunders || 0,
          mistakes: analysis.white_mistakes || 0,
          inaccuracies: analysis.white_inaccuracies || 0,
        },
        black: {
          accuracy: parseFloat(analysis.black_accuracy) || 0,
          acpl: parseFloat(analysis.black_acpl) || 0,
          blunders: analysis.black_blunders || 0,
          mistakes: analysis.black_mistakes || 0,
          inaccuracies: analysis.black_inaccuracies || 0,
        },
      },
    };

    // Include moves if requested
    if (includeMoves) {
      const { data: moves, error: movesError } = await supabase
        .from('move_analysis')
        .select('*')
        .eq('game_id', gameId)
        .order('ply', { ascending: true });

      if (movesError) {
        console.error('Error fetching move analysis:', movesError);
      } else {
        response.moves = (moves || []).map((move) => ({
          ply: move.ply,
          played_move_uci: move.played_move_uci,
          played_move_san: move.played_move_san,
          best_move_uci: move.best_move_uci,
          best_move_san: move.best_move_san,
          eval_before: {
            type: move.eval_before_type || 'cp',
            value: move.eval_before_value || 0,
          },
          eval_after: {
            type: move.eval_after_type || 'cp',
            value: move.eval_after_value || 0,
          },
          eval_loss_cp: move.eval_loss_cp || 0,
          classification: move.classification || 'good',
          pv: move.pv_uci ? move.pv_uci.split(' ') : [],
        }));
      }
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Get game review error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
