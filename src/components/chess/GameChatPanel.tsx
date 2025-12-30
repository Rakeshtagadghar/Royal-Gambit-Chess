'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type ChatMessageRow = {
  id: string;
  game_id: string;
  sender_id: string;
  sender_role: 'player' | 'spectator';
  message: string;
  created_at: string;
  deleted_at: string | null;
};

type ProfileMini = { id: string; username: string; display_name?: string | null };

export function GameChatPanel(props: {
  gameId: string;
  currentUserId: string | null;
  senderRole: 'player' | 'spectator' | null;
  enabled: boolean;
  canSend: boolean;
  className?: string;
}) {
  const { gameId, currentUserId, senderRole, enabled, canSend, className } = props;

  const supabase = useMemo(() => getSupabaseClient(), []);
  const [messages, setMessages] = useState<ChatMessageRow[]>([]);
  const [profilesById, setProfilesById] = useState<Record<string, ProfileMini>>({});
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastSentAtRef = useRef<number>(0);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  const disabledReason = useMemo(() => {
    if (!currentUserId) return 'Log in to chat';
    if (!canSend) return 'Join as spectator to chat';
    if (!senderRole) return 'Unable to determine role';
    return null;
  }, [canSend, currentUserId, senderRole]);

  useEffect(() => {
    if (!enabled) {
      setMessages([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);

      const { data, error: loadError } = await supabase
        .from('game_chat_messages')
        .select('*')
        .eq('game_id', gameId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
        .limit(50);

      if (cancelled) return;

      if (loadError) {
        setError(loadError.message);
        setMessages([]);
      } else {
        setMessages((data ?? []) as ChatMessageRow[]);
      }

      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [enabled, gameId, supabase]);

  // Fetch minimal profiles for visible senders (best-effort)
  useEffect(() => {
    const ids = Array.from(new Set(messages.map((m) => m.sender_id))).filter(
      (id) => !profilesById[id]
    );
    if (ids.length === 0) return;

    let cancelled = false;
    (async () => {
      const { data } = await supabase.from('profiles').select('id, username, display_name').in('id', ids);
      if (cancelled) return;
      const next = { ...profilesById };
      for (const p of (data ?? []) as ProfileMini[]) {
        next[p.id] = p;
      }
      setProfilesById(next);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, supabase]);

  // Realtime subscription
  useEffect(() => {
    if (!enabled) return;
    const channel = supabase
      .channel(`chat:game:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_chat_messages',
          filter: `game_id=eq.${gameId}`,
        },
        (payload: unknown) => {
          const row = (payload as { new?: ChatMessageRow } | null)?.new;
          if (!row || row.deleted_at) return;
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [...prev, row];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, gameId, supabase]);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!currentUserId || !senderRole || !canSend) return;

    // Client-side anti-spam: 1 msg/sec
    const now = Date.now();
    if (now - lastSentAtRef.current < 1000) return;
    lastSentAtRef.current = now;

    setSending(true);
    setError(null);
    try {
      const { error: insertError } = await supabase.from('game_chat_messages').insert({
        game_id: gameId,
        sender_id: currentUserId,
        sender_role: senderRole,
        message: trimmed,
      });

      if (insertError) throw insertError;
      setText('');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to send message';
      setError(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <ScrollArea className="h-80 border rounded-lg">
        <div className="p-3 space-y-3">
          {!enabled ? (
            <div className="text-sm text-muted-foreground">Joining chat…</div>
          ) : loading ? (
            <div className="text-sm text-muted-foreground">Loading chat…</div>
          ) : messages.length === 0 ? (
            <div className="text-sm text-muted-foreground">No messages yet.</div>
          ) : (
            messages.map((m) => {
              const p = profilesById[m.sender_id];
              const name = p?.display_name || p?.username || 'Unknown';
              const isMe = currentUserId && m.sender_id === currentUserId;
              return (
                <div key={m.id} className={cn('text-sm', isMe && 'opacity-95')}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{name}</span>
                    <Badge variant={m.sender_role === 'player' ? 'default' : 'secondary'}>
                      {m.sender_role === 'player' ? 'Player' : 'Spectator'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-foreground whitespace-pre-wrap break-words">{m.message}</div>
                </div>
              );
            })
          )}
          <div ref={scrollAnchorRef} />
        </div>
      </ScrollArea>

      {error && <div className="text-sm text-red-500">{error}</div>}

      <div className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={disabledReason ?? 'Message'}
          disabled={!!disabledReason || sending}
          maxLength={2000}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send();
          }}
        />
        <Button onClick={send} disabled={!!disabledReason || sending || !text.trim()}>
          {sending ? 'Sending…' : 'Send'}
        </Button>
      </div>
    </div>
  );
}


