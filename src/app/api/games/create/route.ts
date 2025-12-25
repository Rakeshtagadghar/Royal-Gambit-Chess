import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ensureProfileExists } from '@/lib/supabase/ensureProfile';
import { ColorPreference, TimeControl } from '@/types/chess';

interface CreateGameBody {
  mode: 'bot' | 'pvp';
  colorPreference: ColorPreference;
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

    // Ensure `profiles` row exists (common after dev resets).
    await ensureProfileExists(supabase, user);

    const body: CreateGameBody = await request.json();
    const { mode, colorPreference, timeControl } = body;

    // Determine colors
    let whiteId: string | null = null;
    let blackId: string | null = null;

    if (colorPreference === 'white') {
      whiteId = user.id;
    } else if (colorPreference === 'black') {
      blackId = user.id;
    } else {
      // Random
      if (Math.random() > 0.5) {
        whiteId = user.id;
      } else {
        blackId = user.id;
      }
    }

    // Create the game
    const { data: game, error: createError } = await supabase
      .from('games')
      .insert({
        mode,
        status: mode === 'bot' ? 'active' : 'waiting',
        white_id: whiteId,
        black_id: blackId,
        created_by: user.id,
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
      gameId: game.id,
      joinUrl: `/game/${game.id}`,
    });
  } catch (error) {
    console.error('Create game error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

