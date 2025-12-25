import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: 'Missing invitation id' }, { status: 400 });

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure the invitation belongs to the sender and is still cancellable.
    const { data: existing, error: existingError } = await supabase
      .from('invitations')
      .select('id, from_user_id, status')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        { error: 'Failed to load invitation', details: existingError.message, code: existingError.code },
        { status: 500 }
      );
    }

    if (!existing) return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    if ((existing.from_user_id as string) !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const status = (existing.status as string) ?? 'pending';
    if (status !== 'pending') {
      return NextResponse.json({ error: 'Only pending invitations can be cancelled' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('invitations')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('from_user_id', user.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to cancel invitation', details: updateError.message, code: updateError.code },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Cancel invitation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


