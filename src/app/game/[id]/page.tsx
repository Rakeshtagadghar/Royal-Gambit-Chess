'use client';

import { useState, useEffect, useCallback } from 'react';
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

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  const { user, isAuthenticated } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [opponentConnected, setOpponentConnected] = useState(false);

  const {
    status,
    boardState,
    playerColor,
    loadGame,
    makeMove,
    setResult,
  } = useGameStore();

  // Fetch game data
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data: game, error: fetchError } = await supabase
          .from('games')
          .select('*')
          .eq('id', gameId)
          .single();

        if (fetchError) throw fetchError;
        if (!game) throw new Error('Game not found');

        // Transform to our Game type
        const transformedGame = {
          id: game.id,
          mode: game.mode as 'bot' | 'pvp',
          status: game.status as 'waiting' | 'active' | 'finished' | 'aborted',
          whitePlayer: game.white_id ? {
            id: game.white_id,
            username: 'Player 1',
            timeRemainingMs: game.time_control?.baseMs || 300000,
          } : undefined,
          blackPlayer: game.black_id ? {
            id: game.black_id,
            username: 'Player 2',
            timeRemainingMs: game.time_control?.baseMs || 300000,
          } : undefined,
          createdBy: game.created_by,
          createdAt: game.created_at,
          startedAt: game.started_at,
          endedAt: game.ended_at,
          initialFen: game.initial_fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          currentFen: game.current_fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          pgn: game.pgn || '',
          result: (game.result || '*') as '1-0' | '0-1' | '1/2-1/2' | '*',
          termination: game.termination,
          timeControl: game.time_control || { baseMs: 300000, incrementMs: 0 },
          moves: [],
        };

        loadGame(transformedGame);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching game:', err);
        setError('Failed to load game');
        setIsLoading(false);
      }
    };

    if (gameId) {
      fetchGame();
    }
  }, [gameId, loadGame]);

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
        (payload: unknown) => {
          console.log('Game update:', payload);
          // Handle game updates
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
    async (from: Square, to: Square, promotion?: PieceSymbol) => {
      if (!isAuthenticated) return;

      try {
        const response = await fetch('/api/games/move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId,
            uci: `${from}${to}${promotion || ''}`,
            clientPly: boardState.moveHistory.length,
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
    [gameId, boardState.moveHistory.length, isAuthenticated]
  );

  const handleResign = async () => {
    if (!isAuthenticated) return;
    
    const result = playerColor === 'w' ? '0-1' : '1-0';
    setResult(result, 'resign');
    
    // Update server
    try {
      await fetch(`/api/games/${gameId}/resign`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to resign:', error);
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
          <Button onClick={() => router.push('/play')}>Back to Play</Button>
        </main>
      </div>
    );
  }

  // Waiting for opponent
  if (status === 'waiting') {
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
                Share this link with your friend to start the game
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={window.location.href}
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
                  username="Opponent"
                  isOnline={opponentConnected}
                />
              </div>

              {/* Chess board */}
              <ChessBoard onMove={handleMove} />

              {/* Bottom player (you) */}
              <div className="w-full max-w-[560px] mt-2">
                <PlayerCard
                  color={playerColor === 'w' ? 'white' : 'black'}
                  username="You"
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

