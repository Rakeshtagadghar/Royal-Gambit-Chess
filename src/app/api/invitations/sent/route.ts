import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'expired';
type ColorPreference = 'white' | 'black' | 'random';

function computeStatus(rawStatus: string, expiresAtIso: string): InvitationStatus {
  const status = rawStatus as InvitationStatus;
  if (status === 'pending') {
    const expiresAt = new Date(expiresAtIso).getTime();
    if (!Number.isNaN(expiresAt) && Date.now() > expiresAt) return 'expired';
  }
  return status;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(Number(searchParams.get('limit') ?? 20) || 20, 1), 50);

    const { data: invites, error: invitesError } = await supabase
      .from('invitations')
      .select('*')
      .eq('from_user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (invitesError) {
      return NextResponse.json(
        { error: 'Failed to fetch invitations', details: invitesError.message, code: invitesError.code },
        { status: 500 }
      );
    }

    const toUserIds = Array.from(
      new Set((invites ?? []).map((i) => i.to_user_id as string | null).filter(Boolean) as string[])
    );

    const toUserById = new Map<string, { username: string; display_name?: string | null }>();
    if (toUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, display_name')
        .in('id', toUserIds);

      (profiles ?? []).forEach((p) => {
        toUserById.set(p.id as string, {
          username: p.username as string,
          display_name: (p.display_name as string | null | undefined) ?? null,
        });
      });
    }

    const items = (invites ?? []).map((inv) => {
      const tc = (inv.time_control ?? {}) as { baseMs?: number; incrementMs?: number };
      const baseMs = Number(tc.baseMs ?? 300000);
      const incrementMs = Number(tc.incrementMs ?? 0);

      const createdAt = (inv.created_at as string) ?? new Date().toISOString();
      const expiresAt = (inv.expires_at as string) ?? new Date(Date.now() + 7 * 864e5).toISOString();

      const toUserId = (inv.to_user_id as string | null) ?? null;
      const toProfile = toUserId ? toUserById.get(toUserId) : undefined;

      return {
        id: inv.id as string,
        fromUserId: inv.from_user_id as string,
        toUserId,
        toEmail: (inv.to_email as string | null) ?? null,
        toUsername: toProfile?.username ?? null,
        status: computeStatus(inv.status as string, expiresAt),
        timeControl: {
          initialSeconds: Math.round(baseMs / 1000),
          incrementSeconds: Math.round(incrementMs / 1000),
        },
        colorPreference: (inv.color_preference as ColorPreference) ?? 'random',
        gameId: (inv.game_id as string | null) ?? null,
        expiresAt,
        createdAt,
      };
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Fetch sent invitations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


