'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type OngoingGameRow = {
  id: string;
  game_mode: string;
  status: string;
  started_at: string | null;
  created_at: string;
  time_control: { baseMs: number; incrementMs: number } | null;
  white_id: string | null;
  black_id: string | null;
  white_username: string | null;
  white_display_name: string | null;
  black_username: string | null;
  black_display_name: string | null;
  move_count: number;
  spectator_count: number;
};

function fmtTimeControl(tc: OngoingGameRow['time_control']) {
  if (!tc) return '—';
  const baseMin = Math.round((tc.baseMs ?? 0) / 60000);
  const incSec = Math.round((tc.incrementMs ?? 0) / 1000);
  return `${baseMin}+${incSec}`;
}

function relTime(ts: string | null) {
  if (!ts) return '—';
  const ms = Date.now() - new Date(ts).getTime();
  const min = Math.max(0, Math.floor(ms / 60000));
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  return `${h}h ago`;
}

export function OngoingGamesList() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [games, setGames] = useState<OngoingGameRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const load = async (nextOffset: number, append: boolean) => {
    try {
      const res = await fetch(`/api/games/ongoing?limit=10&offset=${nextOffset}`);
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || 'Failed to load ongoing games');
      const rows = (j?.games ?? []) as OngoingGameRow[];
      setGames((prev) => (append ? [...prev, ...rows] : rows));
      setOffset(nextOffset + rows.length);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load ongoing games';
      toast.error(msg);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await load(0, false);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const spectate = async (gameId: string) => {
    if (!isAuthenticated) {
      toast.error('Please log in to spectate and chat');
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('/api/spectate/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || 'Failed to join as spectator');
      router.push(`/game/${gameId}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to spectate';
      toast.error(msg);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Ongoing Games</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              setLoading(true);
              await load(0, false);
              setLoading(false);
            }}
          >
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : games.length === 0 ? (
          <div className="text-sm text-muted-foreground">No ongoing games right now.</div>
        ) : (
          <div className="space-y-3">
            {games.map((g) => {
              const white = g.white_display_name || g.white_username || 'White';
              const black = g.black_display_name || g.black_username || 'Black';
              return (
                <div key={g.id} className="border rounded-lg p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {white} vs {black}
                    </div>
                    <div className="text-sm text-muted-foreground flex flex-wrap gap-2">
                      <span>{fmtTimeControl(g.time_control)}</span>
                      <span>•</span>
                      <span>{g.game_mode}</span>
                      <span>•</span>
                      <span>{g.move_count} moves</span>
                      <span>•</span>
                      <span>{relTime(g.started_at)}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="secondary">{g.spectator_count} spectators</Badge>
                    </div>
                  </div>
                  <Button onClick={() => spectate(g.id)} className="shrink-0">
                    Spectate
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-2">
          <Button
            variant="outline"
            className="w-full"
            disabled={loading || loadingMore}
            onClick={async () => {
              setLoadingMore(true);
              await load(offset, true);
              setLoadingMore(false);
            }}
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


