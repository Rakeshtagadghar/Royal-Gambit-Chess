import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ensureProfileExists } from '@/lib/supabase/ensureProfile';

interface JoinGameBody {
  gameId: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure `profiles` row exists before `join_game` writes white_id/black_id (FK -> profiles).
    await ensureProfileExists(supabase, user);

    const body: JoinGameBody = await request.json();
    const { gameId } = body;

    // Preferred: use SQL function (SECURITY DEFINER) to bypass RLS safely.
    // If the function isn't installed yet, we'll fall back to the old logic below.
    const { data: rpcGame, error: rpcError } = await supabase.rpc('join_game', {
      p_game_id: gameId,
    });

    if (!rpcError && rpcGame) {
      return NextResponse.json({ game: rpcGame });
    }

    if (rpcError) {
      console.warn('join_game RPC failed (falling back):', rpcError);
      // If the function isn't installed, the fallback will be blocked by RLS for non-participants.
      if (rpcError.code === 'PGRST202') {
        return NextResponse.json(
          {
            error:
              'Missing SQL function join_game. Run the join_game function SQL in Supabase (schema.sql) and reload the API schema cache, then retry.',
            details: rpcError.details,
            code: rpcError.code,
          },
          { status: 500 }
        );
      }
    }

    // Get the game
    const { data: game, error: fetchError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (fetchError || !game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Check if game is joinable
    if (game.status !== 'waiting') {
      return NextResponse.json({ error: 'Game is not accepting players' }, { status: 400 });
    }

    // Check if user is already in the game
    if (game.white_id === user.id || game.black_id === user.id) {
      return NextResponse.json({ game }); // Already in game
    }

    // Join as the available color
    const updateData: Record<string, string> = {
      status: 'active',
      started_at: new Date().toISOString(),
    };

    if (!game.white_id) {
      updateData.white_id = user.id;
    } else if (!game.black_id) {
      updateData.black_id = user.id;
    } else {
      return NextResponse.json({ error: 'Game is full' }, { status: 400 });
    }

    // Update the game
    const { data: updatedGame, error: updateError } = await supabase
      .from('games')
      .update(updateData)
      .eq('id', gameId)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error('Join game error:', updateError);
      return NextResponse.json(
        {
          error: 'Failed to join game',
          details: updateError.message,
          code: updateError.code,
        },
        { status: 500 }
      );
    }

    if (!updatedGame) {
      // This usually means RLS blocked the update (0 rows affected).
      return NextResponse.json(
        {
          error: 'Failed to join game (update was blocked)',
          details:
            'No rows were updated. This is usually caused by RLS. Install join_game SQL function to enable joining.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ game: updatedGame });
  } catch (error) {
    console.error('Join game error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

