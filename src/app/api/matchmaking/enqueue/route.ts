import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ensureProfileExists } from '@/lib/supabase/ensureProfile';
import { TimeControl } from '@/types/chess';

interface EnqueueBody {
  timeControl: TimeControl;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure `profiles` row exists (queue + games both reference profiles via FKs).
    await ensureProfileExists(supabase, user);

    const body: EnqueueBody = await request.json();
    const { timeControl } = body;

    // Remove any existing queue entry for this user
    await supabase
      .from('matchmaking_queue')
      .delete()
      .eq('user_id', user.id);

    // Check for a match
    const { data: waitingPlayers, error: fetchError } = await supabase
      .from('matchmaking_queue')
      .select('*')
      .eq('time_control->>baseMs', timeControl.baseMs.toString())
      .eq('time_control->>incrementMs', timeControl.incrementMs.toString())
      .neq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1);

    if (fetchError) {
      console.error('Fetch queue error:', fetchError);
    }

    if (waitingPlayers && waitingPlayers.length > 0) {
      const opponent = waitingPlayers[0];
      
      // Remove opponent from queue
      await supabase
        .from('matchmaking_queue')
        .delete()
        .eq('id', opponent.id);

      // Create the game
      const colors = Math.random() > 0.5 
        ? { white_id: user.id, black_id: opponent.user_id }
        : { white_id: opponent.user_id, black_id: user.id };

      const { data: game, error: createError } = await supabase
        .from('games')
        .insert({
          mode: 'pvp',
          status: 'active',
          ...colors,
          created_by: user.id,
          started_at: new Date().toISOString(),
          initial_fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          current_fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          pgn: '',
          result: '*',
          time_control: timeControl,
        })
        .select()
        .single();

      if (createError) {
        console.error('Create game error:', createError);
        return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
      }

      return NextResponse.json({
        ok: true,
        matched: true,
        gameId: game.id,
      });
    }

    // No match found, add to queue
    const { error: insertError } = await supabase
      .from('matchmaking_queue')
      .insert({
        user_id: user.id,
        time_control: timeControl,
      });

    if (insertError) {
      console.error('Insert queue error:', insertError);
      return NextResponse.json({ error: 'Failed to join queue' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, matched: false });
  } catch (error) {
    console.error('Enqueue error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

