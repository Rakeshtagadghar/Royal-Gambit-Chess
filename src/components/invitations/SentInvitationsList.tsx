'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Copy, Loader2, PlugZap, RefreshCcw, XCircle } from 'lucide-react';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

import { useAuth } from '@/hooks/useAuth';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Invitation, InvitationStatus } from '@/types/invitations';

const SENT_INVITES_QUERY_KEY = ['invitations', 'sent'] as const;
const DISMISSED_KEY = 'rg.dismissed_sent_invites.v1';

function formatTimeControl(tc: Invitation['timeControl']) {
  const mins = tc.initialSeconds / 60;
  const base = Number.isInteger(mins) ? String(mins) : `${tc.initialSeconds}s`;
  return `${base}+${tc.incrementSeconds}`;
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

function statusBadge(status: InvitationStatus) {
  switch (status) {
    case 'accepted':
      return { variant: 'default' as const, className: 'bg-emerald-600 text-white border-transparent' };
    case 'declined':
      return { variant: 'outline' as const, className: 'text-muted-foreground' };
    case 'cancelled':
      return { variant: 'secondary' as const, className: '' };
    case 'expired':
      return { variant: 'secondary' as const, className: 'text-muted-foreground' };
    case 'pending':
    default:
      return { variant: 'secondary' as const, className: '' };
  }
}

function computeStatus(rawStatus: string, expiresAtIso: string): InvitationStatus {
  const status = rawStatus as InvitationStatus;
  if (status === 'pending') {
    const expiresAt = new Date(expiresAtIso).getTime();
    if (!Number.isNaN(expiresAt) && Date.now() > expiresAt) return 'expired';
  }
  return status;
}

function mapRealtimeRowToInvitation(row: Record<string, unknown>): Invitation {
  const tc = (row.time_control ?? {}) as { baseMs?: number; incrementMs?: number };
  const baseMs = Number(tc.baseMs ?? 300000);
  const incrementMs = Number(tc.incrementMs ?? 0);

  const createdAt = (row.created_at as string) ?? new Date().toISOString();
  const expiresAt = (row.expires_at as string) ?? new Date(Date.now() + 7 * 864e5).toISOString();

  return {
    id: row.id as string,
    fromUserId: row.from_user_id as string,
    toUserId: (row.to_user_id as string | null) ?? null,
    toEmail: (row.to_email as string | null) ?? null,
    toUsername: null,
    status: computeStatus((row.status as string) ?? 'pending', expiresAt),
    timeControl: {
      initialSeconds: Math.round(baseMs / 1000),
      incrementSeconds: Math.round(incrementMs / 1000),
    },
    colorPreference: ((row.color_preference as string) ?? 'random') as Invitation['colorPreference'],
    gameId: (row.game_id as string | null) ?? null,
    expiresAt,
    createdAt,
  };
}

function statusToast(next: InvitationStatus) {
  if (next === 'accepted') toast.success('Invite accepted', { description: 'You can join the game now.' });
  if (next === 'declined') toast.error('Invite declined');
  if (next === 'cancelled') toast('Invite cancelled');
  if (next === 'expired') toast('Invite expired');
}

export function SentInvitationsList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [realtimeStatus, setRealtimeStatus] = useState<'SUBSCRIBED' | 'CONNECTING' | 'DISCONNECTED'>(
    'CONNECTING'
  );
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const raw = window.localStorage.getItem(DISMISSED_KEY);
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      return new Set(arr);
    } catch {
      return new Set();
    }
  });

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: SENT_INVITES_QUERY_KEY,
    enabled: !!userId,
    queryFn: async (): Promise<Invitation[]> => {
      const res = await fetch('/api/invitations/sent', { method: 'GET' });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || 'Failed to load sent invitations');
      }
      const json = (await res.json()) as { items: Invitation[] };
      return json.items ?? [];
    },
  });

  const items = useMemo(() => {
    const list = data ?? [];
    return list.filter((i) => !dismissedIds.has(i.id));
  }, [data, dismissedIds]);

  useEffect(() => {
    if (!userId) return;

    const supabase = getSupabaseClient();
    const channelName = `invitations:${userId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invitations',
          filter: `from_user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          const eventType = payload.eventType;
          const nextRow =
            eventType === 'DELETE'
              ? (payload.old as unknown as Record<string, unknown> | null)
              : (payload.new as unknown as Record<string, unknown> | null);

          if (!nextRow?.id) return;
          const nextId = String(nextRow.id);

          const existing = queryClient.getQueryData<Invitation[]>(SENT_INVITES_QUERY_KEY) ?? [];
          const prev = existing.find((x) => x.id === nextId);

          if (eventType === 'DELETE') {
            queryClient.setQueryData<Invitation[]>(SENT_INVITES_QUERY_KEY, (old = []) =>
              old.filter((x) => x.id !== nextId)
            );
            return;
          }

          const mapped = mapRealtimeRowToInvitation(nextRow);
          const merged: Invitation = {
            ...mapped,
            // Keep any nicer label we already had from server.
            toUsername: prev?.toUsername ?? mapped.toUsername,
          };

          if (prev && prev.status !== merged.status) statusToast(merged.status);

          queryClient.setQueryData<Invitation[]>(SENT_INVITES_QUERY_KEY, (old = []) => {
            const idx = old.findIndex((x) => x.id === nextId);
            if (idx === -1) return [merged, ...old];
            const copy = old.slice();
            copy[idx] = { ...copy[idx], ...merged };
            return copy;
          });
        }
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') setRealtimeStatus('SUBSCRIBED');
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setRealtimeStatus('DISCONNECTED');
        } else {
          setRealtimeStatus('CONNECTING');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, userId]);

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/invitations/${id}/cancel`, { method: 'POST' });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || 'Failed to cancel invitation');
      }
      return (await res.json()) as { ok: true };
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: SENT_INVITES_QUERY_KEY });
      const previous = queryClient.getQueryData<Invitation[]>(SENT_INVITES_QUERY_KEY) ?? [];
      queryClient.setQueryData<Invitation[]>(SENT_INVITES_QUERY_KEY, (old = []) =>
        old.map((x) => (x.id === id ? { ...x, status: 'cancelled' } : x))
      );
      return { previous };
    },
    onError: (err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(SENT_INVITES_QUERY_KEY, ctx.previous);
      toast.error('Cancel failed', { description: err.message });
    },
    onSuccess: () => {
      toast.success('Invite cancelled');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SENT_INVITES_QUERY_KEY });
    },
  });

  const dismiss = (id: string) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const copyInviteLink = async (id: string) => {
    const url = `${window.location.origin}/play?invite=${id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Invite link copied');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const joinGame = (gameId: string | null) => {
    if (!gameId) return;
    router.push(`/game/${gameId}`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span
            className={[
              'inline-block h-2 w-2 rounded-full',
              realtimeStatus === 'SUBSCRIBED'
                ? 'bg-emerald-500'
                : realtimeStatus === 'CONNECTING'
                  ? 'bg-amber-500'
                  : 'bg-red-500',
            ].join(' ')}
            title={
              realtimeStatus === 'SUBSCRIBED'
                ? 'Realtime connected'
                : realtimeStatus === 'CONNECTING'
                  ? 'Realtime connecting…'
                  : 'Realtime disconnected'
            }
          />
          <span className="flex items-center gap-1">
            <PlugZap className="h-4 w-4" />
            Realtime
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          title="Refresh"
        >
          {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium">Failed to load sent invites</p>
              <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border p-6 text-center">
          <p className="font-medium">No sent invites yet.</p>
          <p className="text-sm text-muted-foreground">Invite a friend to play!</p>
        </div>
      ) : (
        <ScrollArea className="h-[420px] rounded-lg border">
          <div className="divide-y">
            {items.map((inv) => {
              const recipient =
                inv.toUsername ?? inv.toEmail ?? (inv.toUserId ? `User ${inv.toUserId.slice(0, 8)}…` : 'Unknown');
              const badge = statusBadge(inv.status);
              const showJoin = inv.status === 'accepted';
              const showPendingActions = inv.status === 'pending';
              const showDismiss = inv.status === 'declined' || inv.status === 'cancelled' || inv.status === 'expired';

              return (
                <div key={inv.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{recipient}</p>
                        <Badge variant={badge.variant} className={badge.className}>
                          {inv.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span className="font-mono">{formatTimeControl(inv.timeControl)}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span className="capitalize">{inv.colorPreference}</span>
                        <Separator orientation="vertical" className="h-4 hidden sm:block" />
                        <span className="hidden sm:inline">Created {formatWhen(inv.createdAt)}</span>
                        <span className="hidden sm:inline">· Expires {formatWhen(inv.expiresAt)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                      {showPendingActions && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => copyInviteLink(inv.id)}>
                            <Copy className="h-4 w-4" />
                            Copy Link
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelMutation.mutate(inv.id)}
                            disabled={cancelMutation.isPending}
                          >
                            {cancelMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            Cancel
                          </Button>
                        </>
                      )}

                      {showJoin && (
                        <Button
                          size="sm"
                          onClick={() => joinGame(inv.gameId)}
                          disabled={!inv.gameId}
                          title={inv.gameId ? 'Join game' : 'Waiting for acceptance'}
                        >
                          Join Game
                        </Button>
                      )}

                      {showDismiss && (
                        <Button variant="outline" size="sm" onClick={() => dismiss(inv.id)}>
                          Dismiss
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}


