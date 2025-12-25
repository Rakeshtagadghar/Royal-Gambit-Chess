'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { getSupabaseClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { 
  Archive, 
  Clock, 
  Trophy, 
  Bot, 
  Users,
  ChevronRight,
  Loader2 
} from 'lucide-react';

interface GameRecord {
  id: string;
  mode: 'bot' | 'pvp';
  status: string;
  result: string;
  termination: string | null;
  white_id: string;
  black_id: string;
  created_at: string;
  ended_at: string | null;
  time_control: { baseMs: number; incrementMs: number };
  pgn: string;
}

export default function ArchivePage() {
  const { user, isAuthenticated } = useAuth();
  const [games, setGames] = useState<GameRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });

  useEffect(() => {
    const fetchGames = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .or(`white_id.eq.${user.id},black_id.eq.${user.id}`)
          .eq('status', 'finished')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        setGames(data || []);

        // Calculate stats
        let wins = 0, losses = 0, draws = 0;
        (data || []).forEach((game: GameRecord) => {
          const isWhite = game.white_id === user.id;
          if (game.result === '1/2-1/2') {
            draws++;
          } else if ((game.result === '1-0' && isWhite) || (game.result === '0-1' && !isWhite)) {
            wins++;
          } else {
            losses++;
          }
        });
        setStats({ wins, losses, draws });
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, [isAuthenticated, user]);

  const formatTimeControl = (tc: { baseMs: number; incrementMs: number }) => {
    const minutes = tc.baseMs / 60000;
    const increment = tc.incrementMs / 1000;
    return increment > 0 ? `${minutes}+${increment}` : `${minutes}+0`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getResultDisplay = (game: GameRecord) => {
    if (!user) return { text: game.result, color: 'default' };
    
    const isWhite = game.white_id === user.id;
    const isWin = (game.result === '1-0' && isWhite) || (game.result === '0-1' && !isWhite);
    const isDraw = game.result === '1/2-1/2';
    
    if (isWin) return { text: 'Won', color: 'text-green-500' };
    if (isDraw) return { text: 'Draw', color: 'text-yellow-500' };
    return { text: 'Lost', color: 'text-red-500' };
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 text-center">
          <Archive className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Game Archive</h1>
          <p className="text-muted-foreground mb-4">Sign in to view your game history</p>
          <Button asChild>
            <Link href="/login?redirect=/archive">Sign In</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Archive className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Game Archive</h1>
              <p className="text-muted-foreground">Your chess game history</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-3xl font-bold text-green-500">{stats.wins}</p>
                <p className="text-sm text-muted-foreground">Wins</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="h-8 w-8 mx-auto mb-2 text-2xl">🤝</div>
                <p className="text-3xl font-bold text-yellow-500">{stats.draws}</p>
                <p className="text-sm text-muted-foreground">Draws</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="h-8 w-8 mx-auto mb-2 text-2xl">💔</div>
                <p className="text-3xl font-bold text-red-500">{stats.losses}</p>
                <p className="text-sm text-muted-foreground">Losses</p>
              </CardContent>
            </Card>
          </div>

          {/* Games List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Games</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : games.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No games played yet</p>
                  <Button asChild className="mt-4">
                    <Link href="/play">Play Your First Game</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {games.map((game, index) => {
                    const result = getResultDisplay(game);
                    const isWhite = game.white_id === user?.id;
                    
                    return (
                      <motion.div
                        key={game.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link href={`/game/${game.id}/review`}>
                          <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors">
                            {/* Game mode icon */}
                            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                              {game.mode === 'bot' ? (
                                <Bot className="h-5 w-5" />
                              ) : (
                                <Users className="h-5 w-5" />
                              )}
                            </div>

                            {/* Game info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {game.mode === 'bot' ? 'vs Stockfish' : 'Online Game'}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {isWhite ? '♔ White' : '♚ Black'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatTimeControl(game.time_control)}
                                <span>•</span>
                                {formatDate(game.created_at)}
                                {game.termination && (
                                  <>
                                    <span>•</span>
                                    <span className="capitalize">{game.termination.replace('_', ' ')}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Result */}
                            <span className={cn('font-bold', result.color)}>
                              {result.text}
                            </span>

                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

