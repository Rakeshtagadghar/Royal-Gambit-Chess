import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Chess } from 'chess.js';

interface MoveBody {
  gameId: string;
  uci: string;
  clientPly: number;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: MoveBody = await request.json();
    const { gameId, uci, clientPly } = body;

    // Get the game
    const { data: game, error: fetchError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (fetchError || !game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Validate game state
    if (game.status !== 'active') {
      return NextResponse.json({ error: 'Game is not active' }, { status: 400 });
    }

    // Check if user is a participant
    const isWhite = game.white_id === user.id;
    const isBlack = game.black_id === user.id;
    if (!isWhite && !isBlack) {
      return NextResponse.json({ error: 'You are not a participant in this game' }, { status: 403 });
    }

    // Load the game state
    const chess = new Chess(game.current_fen);

    // Check if it's the user's turn
    const turn = chess.turn();
    if ((turn === 'w' && !isWhite) || (turn === 'b' && !isBlack)) {
      return NextResponse.json({ error: 'Not your turn' }, { status: 400 });
    }

    // Get move history to check ply
    const history = chess.history();
    if (history.length !== clientPly) {
      return NextResponse.json({ 
        error: 'Out of sync',
        serverPly: history.length,
        currentFen: chess.fen(),
      }, { status: 409 });
    }

    // Parse and validate the move
    const from = uci.substring(0, 2);
    const to = uci.substring(2, 4);
    const promotion = uci.length > 4 ? uci[4] : undefined;

    try {
      const move = chess.move({ from, to, promotion });
      if (!move) {
        return NextResponse.json({ error: 'Illegal move' }, { status: 400 });
      }

      // Check for game over
      let result = '*';
      let termination = null;
      let status = 'active';

      if (chess.isGameOver()) {
        status = 'finished';
        
        if (chess.isCheckmate()) {
          result = turn === 'w' ? '1-0' : '0-1';
          termination = 'checkmate';
        } else if (chess.isStalemate()) {
          result = '1/2-1/2';
          termination = 'stalemate';
        } else if (chess.isThreefoldRepetition()) {
          result = '1/2-1/2';
          termination = 'threefold_repetition';
        } else if (chess.isInsufficientMaterial()) {
          result = '1/2-1/2';
          termination = 'insufficient_material';
        } else if (chess.isDraw()) {
          result = '1/2-1/2';
          termination = 'fifty_move_rule';
        }
      }

      // Update the game
      const { error: updateError } = await supabase
        .from('games')
        .update({
          current_fen: chess.fen(),
          pgn: chess.pgn(),
          status,
          result,
          termination,
          ...(status === 'finished' ? { ended_at: new Date().toISOString() } : {}),
        })
        .eq('id', gameId);

      if (updateError) {
        console.error('Update game error:', updateError);
        return NextResponse.json({ error: 'Failed to update game' }, { status: 500 });
      }

      // Insert move record
      await supabase.from('moves').insert({
        game_id: gameId,
        ply: clientPly + 1,
        uci,
        san: move.san,
        fen_after: chess.fen(),
      });

      return NextResponse.json({
        accepted: true,
        game: {
          currentFen: chess.fen(),
          pgn: chess.pgn(),
          status,
          result,
          termination,
        },
      });
    } catch {
      return NextResponse.json({ error: 'Invalid move format' }, { status: 400 });
    }
  } catch (error) {
    console.error('Move error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

