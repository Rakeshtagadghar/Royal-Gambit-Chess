'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { TIME_CONTROLS, TimeControl, ColorPreference } from '@/types/chess';
import { toast } from 'sonner';
import { getSupabaseClient } from '@/lib/supabase/client';
import { 
  Users, 
  UserPlus, 
  Copy, 
  Check, 
  Loader2,
  Clock,
  Link as LinkIcon
} from 'lucide-react';

function LobbyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  
  const initialMode = searchParams.get('mode') || 'friend';
  const [activeTab, setActiveTab] = useState(initialMode);
  const [selectedTimeControl, setSelectedTimeControl] = useState<TimeControl>(TIME_CONTROLS[4].control);
  const [selectedColor, setSelectedColor] = useState<ColorPreference>('random');
  const [gameLink, setGameLink] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isQueuing, setIsQueuing] = useState(false);
  const [copied, setCopied] = useState(false);
  const queueStartedAtRef = useRef<string | null>(null);
  const redirectedRef = useRef(false);

  const createGame = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/lobby');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/games/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'pvp',
          colorPreference: selectedColor,
          timeControl: selectedTimeControl,
        }),
      });

      if (!response.ok) throw new Error('Failed to create game');

      const { gameId } = await response.json();
      const link = `${window.location.origin}/game/${gameId}`;
      setGameLink(link);
      toast.success('Game created! Share the link with your friend.');
    } catch (error) {
      toast.error('Failed to create game');
    } finally {
      setIsCreating(false);
    }
  };

  const joinGame = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/lobby');
      return;
    }

    if (!joinCode.trim()) {
      toast.error('Please enter a game code');
      return;
    }

    setIsJoining(true);
    try {
      // Extract game ID from URL if full URL was pasted
      let gameId = joinCode.trim();
      if (gameId.includes('/game/')) {
        gameId = gameId.split('/game/').pop() || '';
      }

      const response = await fetch('/api/games/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId }),
      });

      if (!response.ok) throw new Error('Failed to join game');

      router.push(`/game/${gameId}`);
    } catch (error) {
      toast.error('Failed to join game. Check the code and try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const joinQueue = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/lobby?mode=queue');
      return;
    }

    setIsQueuing(true);
    redirectedRef.current = false;
    queueStartedAtRef.current = new Date().toISOString();
    try {
      const response = await fetch('/api/matchmaking/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeControl: selectedTimeControl }),
      });

      if (!response.ok) throw new Error('Failed to join queue');

      const payload = await response.json().catch(() => ({}));
      if (payload?.matched && payload?.gameId) {
        redirectedRef.current = true;
        router.push(`/game/${payload.gameId}`);
        return;
      }

      toast.success('Looking for an opponent...');
    } catch (error) {
      toast.error('Failed to join queue');
      setIsQueuing(false);
    }
  };

  const leaveQueue = async () => {
    try {
      await fetch('/api/matchmaking/dequeue', {
        method: 'POST',
      });
      setIsQueuing(false);
      toast.success('Left the queue');
    } catch (error) {
      console.error('Failed to leave queue:', error);
    }
  };

  useEffect(() => {
    if (!isQueuing) return;
    if (!isAuthenticated || !user?.id) return;
    if (redirectedRef.current) return;

    const since = queueStartedAtRef.current ?? new Date().toISOString();
    const supabase = getSupabaseClient();

    const matchesSelectedTimeControl = (timeControl: unknown) => {
      const tc = timeControl as { baseMs?: number | string; incrementMs?: number | string } | null;
      if (!tc) return false;
      const base = Number(tc.baseMs);
      const inc = Number(tc.incrementMs);
      return base === selectedTimeControl.baseMs && inc === selectedTimeControl.incrementMs;
    };

    const maybeRedirectToGame = (gameId: string) => {
      if (redirectedRef.current) return;
      redirectedRef.current = true;
      router.push(`/game/${gameId}`);
    };

    // Realtime: listen for a new game where current user is white or black.
    const channelWhite = supabase
      .channel(`mm-white-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'games',
          filter: `white_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new as any;
          if (row?.status !== 'active') return;
          if (!matchesSelectedTimeControl(row?.time_control)) return;
          if (row?.created_at && row.created_at < since) return;
          if (row?.id) maybeRedirectToGame(row.id);
        }
      )
      .subscribe();

    const channelBlack = supabase
      .channel(`mm-black-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'games',
          filter: `black_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new as any;
          if (row?.status !== 'active') return;
          if (!matchesSelectedTimeControl(row?.time_control)) return;
          if (row?.created_at && row.created_at < since) return;
          if (row?.id) maybeRedirectToGame(row.id);
        }
      )
      .subscribe();

    // Polling fallback in case realtime is not configured/enabled.
    const poll = async () => {
      if (redirectedRef.current) return;
      try {
        const qs = new URLSearchParams({
          since,
          baseMs: selectedTimeControl.baseMs.toString(),
          incrementMs: selectedTimeControl.incrementMs.toString(),
        });
        const res = await fetch(`/api/games/ongoing?${qs.toString()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.gameId) maybeRedirectToGame(data.gameId);
      } catch {
        // ignore
      }
    };

    poll();
    const interval = window.setInterval(poll, 2000);

    return () => {
      window.clearInterval(interval);
      supabase.removeChannel(channelWhite);
      supabase.removeChannel(channelBlack);
    };
  }, [isQueuing, isAuthenticated, user?.id, selectedTimeControl.baseMs, selectedTimeControl.incrementMs, router]);

  const copyLink = () => {
    if (gameLink) {
      navigator.clipboard.writeText(gameLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copied to clipboard');
    }
  };

  const goToGame = () => {
    if (gameLink) {
      const gameId = gameLink.split('/game/').pop();
      router.push(`/game/${gameId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Game Lobby</h1>
              <p className="text-muted-foreground">Create or join an online game</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="friend">
                <LinkIcon className="h-4 w-4 mr-2" />
                Play with Friend
              </TabsTrigger>
              <TabsTrigger value="queue">
                <UserPlus className="h-4 w-4 mr-2" />
                Find Opponent
              </TabsTrigger>
            </TabsList>

            <TabsContent value="friend" className="space-y-4 mt-6">
              {/* Create Game */}
              <Card>
                <CardHeader>
                  <CardTitle>Create a Game</CardTitle>
                  <CardDescription>
                    Configure your game and share the link
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Time Control */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Time Control</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {TIME_CONTROLS.slice(0, 5).map((tc) => (
                        <Button
                          key={tc.label}
                          variant={
                            selectedTimeControl.baseMs === tc.control.baseMs &&
                            selectedTimeControl.incrementMs === tc.control.incrementMs
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() => setSelectedTimeControl(tc.control)}
                        >
                          {tc.label.split(' ')[1]}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Play As</label>
                    <div className="flex gap-2">
                      {[
                        { value: 'white', label: '♔ White' },
                        { value: 'black', label: '♚ Black' },
                        { value: 'random', label: '🎲 Random' },
                      ].map((option) => (
                        <Button
                          key={option.value}
                          variant={selectedColor === option.value ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1"
                          onClick={() => setSelectedColor(option.value as ColorPreference)}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {gameLink ? (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input value={gameLink} readOnly className="font-mono text-sm" />
                        <Button variant="outline" size="icon" onClick={copyLink}>
                          {copied ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={goToGame} className="flex-1">
                          Go to Game
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setGameLink(null)}
                        >
                          Create New
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      onClick={createGame} 
                      className="w-full"
                      disabled={isCreating}
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Game'
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Join Game */}
              <Card>
                <CardHeader>
                  <CardTitle>Join a Game</CardTitle>
                  <CardDescription>
                    Enter a game link or code to join
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Paste game link or code..."
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                  />
                  <Button 
                    onClick={joinGame} 
                    className="w-full"
                    disabled={isJoining || !joinCode.trim()}
                  >
                    {isJoining ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      'Join Game'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="queue" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Match</CardTitle>
                  <CardDescription>
                    Find an opponent automatically
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Time Control */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Time Control</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {TIME_CONTROLS.slice(0, 5).map((tc) => (
                        <Button
                          key={tc.label}
                          variant={
                            selectedTimeControl.baseMs === tc.control.baseMs &&
                            selectedTimeControl.incrementMs === tc.control.incrementMs
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() => !isQueuing && setSelectedTimeControl(tc.control)}
                          disabled={isQueuing}
                        >
                          {tc.label.split(' ')[1]}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {isQueuing ? (
                    <div className="text-center py-6">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                        className="inline-block mb-4"
                      >
                        <Clock className="h-12 w-12 text-primary" />
                      </motion.div>
                      <p className="font-medium mb-2">Looking for opponent...</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        This may take a few moments
                      </p>
                      <Button variant="outline" onClick={leaveQueue}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={joinQueue} className="w-full">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Find Opponent
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}

export default function LobbyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LobbyContent />
    </Suspense>
  );
}

