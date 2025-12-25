'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Square } from 'chess.js';
import type { PieceSymbol } from 'chess.js';
import { Navbar } from '@/components/layout/Navbar';
import { ChessBoard, MoveList, PlayerCard, GameActions, MoveControls } from '@/components/chess';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useGameStore } from '@/stores/gameStore';
import { useStockfish } from '@/hooks/useStockfish';
import { useAuth } from '@/hooks/useAuth';
import { BOT_DIFFICULTIES, BotDifficulty, TIME_CONTROLS, TimeControl } from '@/types/chess';
import { cn } from '@/lib/utils';
import { Bot, Play, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

type GamePhase = 'setup' | 'playing';

export default function BotPage() {
  const { profile } = useAuth();
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [selectedDifficulty, setSelectedDifficulty] = useState<BotDifficulty>(BOT_DIFFICULTIES[1]);
  const [selectedColor, setSelectedColor] = useState<'white' | 'black' | 'random'>('white');
  const [selectedTimeControl, setSelectedTimeControl] = useState<TimeControl>(TIME_CONTROLS[4].control); // 5+0

  const {
    boardState,
    status,
    playerColor,
    gameId,
    initGame,
    makeMove,
    setResult,
    reset,
    getCurrentFen,
  } = useGameStore();

  const submitMove = useCallback(
    async (from: string, to: string, promotion: string | undefined, clientPly: number) => {
      if (!gameId) return;
      try {
        const resp = await fetch('/api/games/move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId,
            uci: `${from}${to}${promotion || ''}`,
            clientPly,
          }),
        });
        if (!resp.ok) {
          const j = await resp.json().catch(() => ({}));
          throw new Error(j?.error || 'Failed to sync move');
        }
      } catch (e) {
        console.warn('Bot game move sync failed:', e);
      }
    },
    [gameId]
  );

  // Handle bot move
  const handleBotMove = useCallback(
    (from: Square, to: Square, promotion?: string) => {
      const clientPly = useGameStore.getState().boardState.moveHistory.length;
      const ok = makeMove(from, to, promotion as PieceSymbol | undefined);
      if (ok) {
        submitMove(from, to, promotion, clientPly);
      }
    },
    [makeMove, submitMove]
  );

  const { isThinking, think } = useStockfish({
    difficulty: selectedDifficulty,
    onMove: handleBotMove,
    enabled: phase === 'playing',
  });

  // Trigger bot move when it's bot's turn
  useEffect(() => {
    if (phase !== 'playing' || status !== 'active') return;

    const isBotTurn = playerColor !== boardState.turn;
    if (isBotTurn && !isThinking) {
      // Small delay before bot starts thinking
      const timeout = setTimeout(() => {
        think(getCurrentFen());
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [phase, status, playerColor, boardState.turn, isThinking, think, getCurrentFen]);

  const startGame = async () => {
    const color = selectedColor === 'random' 
      ? (Math.random() > 0.5 ? 'white' : 'black')
      : selectedColor;

    try {
      const resp = await fetch('/api/games/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'bot',
          colorPreference: color,
          timeControl: selectedTimeControl,
        }),
      });
      const j = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(j?.error || 'Failed to create bot game');

      initGame({
        mode: 'bot',
        playerColor: color === 'white' ? 'w' : 'b',
        timeControl: selectedTimeControl,
        botDifficulty: selectedDifficulty,
        gameId: j.gameId,
      });
      setPhase('playing');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to start game';
      toast.error(msg);
    }
  };

  const handleResign = async () => {
    const result = playerColor === 'w' ? '0-1' : '1-0';
    setResult(result, 'resign');

    if (gameId) {
      try {
        await fetch(`/api/games/${gameId}/resign`, { method: 'POST' });
      } catch {
        // ignore
      }
    }
  };

  const handleRematch = () => {
    startGame();
  };

  const handleNewGame = () => {
    reset();
    setPhase('setup');
  };

  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <Bot className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Play vs Bot</h1>
                <p className="text-muted-foreground">Configure your game against Stockfish</p>
              </div>
            </div>

            {/* Difficulty Selection */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Difficulty</CardTitle>
                <CardDescription>Choose how strong the bot should be</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {BOT_DIFFICULTIES.map((diff) => (
                    <Button
                      key={diff.label}
                      variant={selectedDifficulty.label === diff.label ? 'default' : 'outline'}
                      className="flex flex-col h-auto py-3"
                      onClick={() => setSelectedDifficulty(diff)}
                    >
                      <span className="font-semibold">{diff.label}</span>
                      <span className="text-xs opacity-70">{diff.description}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Color Selection */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Play As</CardTitle>
                <CardDescription>Choose your color</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {(
                    [
                      { value: 'white', label: 'White', emoji: '♔' },
                      { value: 'black', label: 'Black', emoji: '♚' },
                      { value: 'random', label: 'Random', emoji: '🎲' },
                    ] as const
                  ).map((option) => (
                    <Button
                      key={option.value}
                      variant={selectedColor === option.value ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setSelectedColor(option.value)}
                    >
                      <span className="mr-2 text-xl">{option.emoji}</span>
                      {option.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Time Control Selection */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg">Time Control</CardTitle>
                <CardDescription>Set the clock for both players</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {TIME_CONTROLS.slice(0, 10).map((tc) => (
                    <Button
                      key={tc.label}
                      variant={
                        selectedTimeControl.baseMs === tc.control.baseMs &&
                        selectedTimeControl.incrementMs === tc.control.incrementMs
                          ? 'default'
                          : 'outline'
                      }
                      className="text-sm"
                      onClick={() => setSelectedTimeControl(tc.control)}
                    >
                      {tc.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Start Button */}
            <Button 
              size="lg" 
              className="w-full text-lg" 
              onClick={startGame}
            >
              <Play className="mr-2 h-5 w-5" />
              Start Game
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

  // Playing phase
  const botColor: 'white' | 'black' = playerColor === 'w' ? 'black' : 'white';
  const humanColor: 'white' | 'black' = playerColor === 'w' ? 'white' : 'black';

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
                <div className="flex items-center justify-between gap-2">
                  <PlayerCard
                    color={botColor}
                    username={`Stockfish ${selectedDifficulty.label}`}
                    isBot
                    isOnline
                  />
                  {isThinking && (
                    <motion.div
                      className="flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-sm border border-primary/30 px-4 py-2 rounded-xl shadow-lg"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <motion.span
                        className="text-xl"
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        ♟
                      </motion.span>
                      <span className="text-sm font-medium text-foreground">
                        Analyzing
                        <motion.span
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                          ...
                        </motion.span>
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Chess board */}
              <ChessBoard
                onMove={(from, to, promotion, clientPly) => {
                  submitMove(from, to, promotion, clientPly);
                }}
              />

              {/* Bottom player (you) */}
              <div className="w-full max-w-[560px] mt-2">
                <PlayerCard
                  color={humanColor}
                  username={profile?.username || 'Guest'}
                  displayName={profile?.displayName}
                  avatarUrl={profile?.avatarUrl}
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
                  <CardTitle className="text-lg">Game Info</CardTitle>
                  <span className={cn(
                    'text-sm px-2 py-1 rounded',
                    status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'
                  )}>
                    {status === 'active' ? 'In Progress' : status === 'finished' ? 'Finished' : status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  onRematch={handleRematch}
                  onNewGame={handleNewGame}
                  showRematch={status === 'finished'}
                />

                {status === 'finished' && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleNewGame}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    New Game
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

