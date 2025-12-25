import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    const body: JoinGameBody = await request.json();
    const { gameId } = body;

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
      .single();

    if (updateError) {
      console.error('Join game error:', updateError);
      return NextResponse.json({ error: 'Failed to join game' }, { status: 500 });
    }

    return NextResponse.json({ game: updatedGame });
  } catch (error) {
    console.error('Join game error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

