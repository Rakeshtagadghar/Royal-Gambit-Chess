'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { Square, PieceSymbol } from 'chess.js';
import { Navbar } from '@/components/layout/Navbar';
import { ChessBoard, MoveList, PlayerCard, GameActions, MoveControls } from '@/components/chess';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useGameStore } from '@/stores/gameStore';
import { useAuth } from '@/hooks/useAuth';
import { getSupabaseClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Loader2, Copy, Check, Share2 } from 'lucide-react';

type GameRow = Record<string, any> & {
  white?: { id: string; username: string; display_name?: string | null; avatar_url?: string | null } | null;
  black?: { id: string; username: string; display_name?: string | null; avatar_url?: string | null } | null;
};

function transformGameRow(game: GameRow) {
  const whiteProfile = game.white ?? null;
  const blackProfile = game.black ?? null;
  return {
    id: game.id,
    mode: game.mode as 'bot' | 'pvp',
    status: game.status as 'waiting' | 'active' | 'finished' | 'aborted',
    whitePlayer: game.white_id
      ? {
          id: game.white_id,
          username: whiteProfile?.username ?? 'Player 1',
          displayName: whiteProfile?.display_name ?? undefined,
          avatarUrl: whiteProfile?.avatar_url ?? undefined,
          timeRemainingMs: game.time_control?.baseMs || 300000,
        }
      : undefined,
    blackPlayer: game.black_id
      ? {
          id: game.black_id,
          username: blackProfile?.username ?? 'Player 2',
          displayName: blackProfile?.display_name ?? undefined,
          avatarUrl: blackProfile?.avatar_url ?? undefined,
          timeRemainingMs: game.time_control?.baseMs || 300000,
        }
      : undefined,
    createdBy: game.created_by,
    createdAt: game.created_at,
    startedAt: game.started_at,
    endedAt: game.ended_at,
    initialFen:
      game.initial_fen ||
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    currentFen:
      game.current_fen ||
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    pgn: game.pgn || '',
    result: (game.result || '*') as '1-0' | '0-1' | '1/2-1/2' | '*',
    termination: game.termination,
    timeControl: game.time_control || { baseMs: 300000, incrementMs: 0 },
    moves: [],
  };
}

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  const { user, profile, isAuthenticated } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [rawGame, setRawGame] = useState<GameRow | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [profilesById, setProfilesById] = useState<
    Record<string, { id: string; username: string; displayName?: string; avatarUrl?: string }>
  >({});

  const {
    status,
    boardState,
    playerColor,
    loadGame,
    makeMove,
    setResult,
    setPlayerColor,
  } = useGameStore();

  // Fetch game data
  useEffect(() => {
    const fetchGame = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('🔵 Fetching game:', gameId);

        const timeoutMs = 10000;
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timed out loading game. Please retry.')), timeoutMs)
        );

        const queryPromise = fetch(`/api/games/get?gameId=${encodeURIComponent(gameId)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        const response = await Promise.race([queryPromise, timeoutPromise]);
        const json = await response.json();

        if (!response.ok) {
          throw new Error(json?.error || 'Failed to load game');
        }

        const game = json.game as Record<string, any>;
        if (!game) throw new Error('Game not found');

        setRawGame(game);

        // If the API already returned nested player profiles, seed our local cache for realtime friendliness.
        setProfilesById((prev) => {
          const next = { ...prev };
          const white = (game as GameRow).white;
          const black = (game as GameRow).black;
          if (white?.id) {
            next[white.id] = {
              id: white.id,
              username: white.username,
              displayName: white.display_name ?? undefined,
              avatarUrl: white.avatar_url ?? undefined,
            };
          }
          if (black?.id) {
            next[black.id] = {
              id: black.id,
              username: black.username,
              displayName: black.display_name ?? undefined,
              avatarUrl: black.avatar_url ?? undefined,
            };
          }
          return next;
        });

        loadGame(transformGameRow(game as GameRow));
      } catch (err: any) {
        console.error('Error fetching game:', err);
        setError(err?.message || 'Failed to load game');
      } finally {
        setIsLoading(false);
      }
    };

    if (gameId) {
      fetchGame();
    }
  }, [gameId, loadGame]);

  // Set player color once we have both the game and the user
  useEffect(() => {
    if (!rawGame || !user) return;
    if (rawGame.white_id === user.id) setPlayerColor('w');
    else if (rawGame.black_id === user.id) setPlayerColor('b');
    else setPlayerColor(null);
  }, [rawGame, user, setPlayerColor]);

  // Load profile info for both players (PvP) so we can show opponent name/avatar.
  useEffect(() => {
    const loadProfiles = async () => {
      if (!rawGame) return;

      // If the realtime payload includes nested profiles (rare) or we already have them cached, skip fetch.
      const ids = [rawGame.white_id, rawGame.black_id].filter(Boolean) as string[];
      const missing = ids.filter((id) => !profilesById[id]);
      if (missing.length === 0) return;

      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', missing);

        if (error) {
          console.warn('Failed to load player profiles:', error);
          return;
        }

        setProfilesById((prev) => {
          const next = { ...prev };
          (data ?? []).forEach((p: Record<string, unknown>) => {
            const id = p.id as string;
            next[id] = {
              id,
              username: (p.username as string) ?? 'Player',
              displayName: (p.display_name as string | null | undefined) ?? undefined,
              avatarUrl: (p.avatar_url as string | null | undefined) ?? undefined,
            };
          });
          return next;
        });
      } catch (e) {
        console.warn('Failed to load player profiles:', e);
      }
    };

    loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawGame?.white_id, rawGame?.black_id]);

  const youInfo = useMemo(() => {
    const fallbackName = user?.email?.split('@')[0] || 'You';
    return {
      username: profile?.username || fallbackName,
      displayName: profile?.displayName,
      avatarUrl: profile?.avatarUrl,
    };
  }, [profile?.avatarUrl, profile?.displayName, profile?.username, user?.email]);

  const opponentInfo = useMemo(() => {
    if (!rawGame) return { username: 'Opponent' as string, displayName: undefined as string | undefined, avatarUrl: undefined as string | undefined, isBot: false as boolean };
    if (rawGame.mode === 'bot') {
      return { username: 'Stockfish', displayName: 'Stockfish', avatarUrl: undefined, isBot: true };
    }
    if (!user) return { username: 'Opponent', displayName: undefined, avatarUrl: undefined, isBot: false };

    const opponentId =
      rawGame.white_id === user.id ? (rawGame.black_id as string | null) : (rawGame.white_id as string | null);

    if (!opponentId) return { username: 'Waiting…', displayName: 'Waiting…', avatarUrl: undefined, isBot: false };

    const p = profilesById[opponentId];
    return {
      username: p?.username || 'Opponent',
      displayName: p?.displayName,
      avatarUrl: p?.avatarUrl,
      isBot: false,
    };
  }, [profilesById, rawGame, user]);

  const joinGame = async () => {
    if (!isAuthenticated || !user || !rawGame) return;
    setIsJoining(true);
    try {
      const res = await fetch('/api/games/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to join game');

      toast.success('Joined game');

      const joinedGame = (data?.game ?? null) as GameRow | null;
      if (joinedGame) {
        setRawGame(joinedGame);
        loadGame(transformGameRow(joinedGame));
      } else {
        // Safety fallback: re-load via server API if response didn't include a game
        const resp = await fetch(`/api/games/get?gameId=${encodeURIComponent(gameId)}`);
        const j = await resp.json();
        if (!resp.ok) throw new Error(j?.error || 'Failed to reload game');
        setRawGame(j.game);
        loadGame(transformGameRow(j.game));
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to join game');
    } finally {
      setIsJoining(false);
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    if (!gameId || isLoading) return;

    const supabase = getSupabaseClient();
    
    // Subscribe to game changes
    const channel = supabase
      .channel(`game:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload: any) => {
          console.log('Game update:', payload);
          const next = payload?.new as GameRow | undefined;
          if (next && next.id) {
            setRawGame(next);
            loadGame(transformGameRow(next));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'moves',
          filter: `game_id=eq.${gameId}`,
        },
        (payload: unknown) => {
          console.log('New move:', payload);
          // Handle new moves from opponent
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setOpponentConnected(Object.keys(state).length > 1);
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED' && user) {
          await channel.track({ user_id: user.id });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, isLoading, user]);

  // Handle move
  const handleMove = useCallback(
    async (from: Square, to: Square, promotion: PieceSymbol | undefined, clientPly: number) => {
      if (!isAuthenticated) return;

      try {
        const response = await fetch('/api/games/move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId,
            uci: `${from}${to}${promotion || ''}`,
            clientPly,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to make move');
        }
      } catch (error) {
        toast.error('Failed to submit move');
        console.error('Move error:', error);
      }
    },
    [gameId, isAuthenticated]
  );

  const handleResign = async () => {
    if (!isAuthenticated) return;
    
    const result = playerColor === 'w' ? '0-1' : '1-0';
    setResult(result, 'resign');
    
    // Update server
    try {
      const resp = await fetch(`/api/games/${gameId}/resign`, { method: 'POST' });
      const j = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(j?.error || 'Failed to resign');

      if (j?.game) {
        setRawGame(j.game);
        loadGame(transformGameRow(j.game));
      }
    } catch (error) {
      console.error('Failed to resign:', error);
      toast.error('Failed to resign. Please retry.');
    }
  };

  const handleOfferDraw = async () => {
    toast.info('Draw offer sent to opponent');
    // Implement draw offer logic
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
            <Button onClick={() => router.push('/play')}>Back to Play</Button>
          </div>
        </main>
      </div>
    );
  }

  // Waiting for opponent
  if (status === 'waiting') {
    const isParticipant =
      !!user && !!rawGame && (rawGame.white_id === user.id || rawGame.black_id === user.id);
    const canJoin =
      !!user &&
      !!rawGame &&
      !isParticipant &&
      rawGame.status === 'waiting' &&
      (rawGame.white_id === null || rawGame.black_id === null);

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Waiting for Opponent</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <motion.div
                className="text-6xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                ♟
              </motion.div>
              <p className="text-muted-foreground">
                {canJoin ? 'Join this game to start playing.' : 'Share this link with your friend to start the game'}
              </p>
              {canJoin && (
                <Button className="w-full" onClick={joinGame} disabled={isJoining}>
                  {isJoining ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    'Join Game'
                  )}
                </Button>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={window.location.href}
                  aria-label="Game link"
                  title="Game link"
                  readOnly
                  className="flex-1 px-3 py-2 text-sm bg-muted rounded-md font-mono truncate"
                />
                <Button variant="outline" size="icon" onClick={copyLink}>
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button variant="outline" className="w-full" onClick={copyLink}>
                <Share2 className="mr-2 h-4 w-4" />
                Share Link
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Active game
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
          {/* Board Section */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              {/* Top player (opponent) */}
              <div className="w-full max-w-[560px] mb-2">
                <PlayerCard
                  color={playerColor === 'w' ? 'black' : 'white'}
                  username={opponentInfo.username}
                  displayName={opponentInfo.displayName}
                  avatarUrl={opponentInfo.avatarUrl}
                  isBot={opponentInfo.isBot}
                  isOnline={opponentConnected}
                />
              </div>

              {/* Chess board */}
              <ChessBoard onMove={handleMove} />

              {/* Bottom player (you) */}
              <div className="w-full max-w-[560px] mt-2">
                <PlayerCard
                  color={playerColor === 'w' ? 'white' : 'black'}
                  username={youInfo.username}
                  displayName={youInfo.displayName}
                  avatarUrl={youInfo.avatarUrl}
                  isOnline
                />
              </div>
            </motion.div>
          </div>

          {/* Side Panel */}
          <div className="w-full lg:w-80">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Game</CardTitle>
                  <span className={cn(
                    'text-sm px-2 py-1 rounded',
                    status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'
                  )}>
                    {status === 'active' ? 'In Progress' : status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Connection status */}
                <div className="flex items-center gap-2 text-sm">
                  <span className={cn(
                    'h-2 w-2 rounded-full',
                    opponentConnected ? 'bg-green-500' : 'bg-yellow-500'
                  )} />
                  {opponentConnected ? 'Opponent connected' : 'Waiting for opponent'}
                </div>

                <Separator />

                {/* Move List */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Moves</h3>
                  <MoveList className="border rounded-lg" />
                  <MoveControls />
                </div>

                <Separator />

                {/* Game Actions */}
                <GameActions
                  onResign={handleResign}
                  onOfferDraw={handleOfferDraw}
                  showRematch={status === 'finished'}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

