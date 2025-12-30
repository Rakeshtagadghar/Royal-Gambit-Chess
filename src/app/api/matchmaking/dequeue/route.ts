import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let admin: ReturnType<typeof createAdminClient>;
    try {
      admin = createAdminClient();
    } catch (e) {
      console.error('Missing/invalid Supabase admin config:', e);
      return NextResponse.json(
        { error: 'Matchmaking server is misconfigured (missing SUPABASE_SERVICE_ROLE_KEY)' },
        { status: 500 }
      );
    }

    // Remove from queue
    const { error } = await admin
      .from('matchmaking_queue')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Dequeue error:', error);
      return NextResponse.json({ error: 'Failed to leave queue' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Dequeue error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

