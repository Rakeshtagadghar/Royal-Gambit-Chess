'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Chess } from 'chess.js';
import { motion } from 'framer-motion';
import { Chessboard } from 'react-chessboard';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  ReviewPlayerCard,
  EvaluationBar,
  ReviewMoveTimeline,
  MoveDetailPanel,
  AccuracyChart,
  ReviewNavigation,
} from '@/components/review';
import { useGameReview } from '@/hooks/useGameReview';
import { useSettingsStore, BOARD_THEMES } from '@/stores/settingsStore';
import { apiUrls } from '@/lib/api/urls';
import { Loader2, BarChart3, ArrowLeft, RefreshCw, Clock, AlertCircle } from 'lucide-react';
import type { TimeControl, MoveAnalysis } from '@/types/chess';

interface GameRow {
  id: string;
  mode: 'bot' | 'pvp';
  game_mode?: string | null;
  status: 'waiting' | 'active' | 'finished' | 'aborted';
  white_id: string | null;
  black_id: string | null;
  created_by: string;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
  initial_fen: string | null;
  current_fen: string | null;
  pgn: string | null;
  result: string | null;
  termination: string | null;
  time_control: TimeControl | null;
  white?: { id: string; username: string; display_name?: string | null; avatar_url?: string | null } | null;
  black?: { id: string; username: string; display_name?: string | null; avatar_url?: string | null } | null;
}

export default function GameReviewPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  const t = useTranslations('gameReview');

  const { boardTheme, enableAnimations, animationSpeed } = useSettingsStore();

  // Game data state
  const [game, setGame] = useState<GameRow | null>(null);
  const [gameLoading, setGameLoading] = useState(true);
  const [gameError, setGameError] = useState<string | null>(null);

  // Review navigation state
  const [currentPly, setCurrentPly] = useState(0);
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');

  // Board size
  const [boardWidth, setBoardWidth] = useState(480);

  // Use the game review hook
  const {
    status: analysisStatus,
    analysis,
    moves: analysisMoves,
    progress,
    isLoading: reviewLoading,
    error: reviewError,
    queueAnalysis,
    refreshReview,
  } = useGameReview(gameId, { autoQueue: false });

  // Fetch game data
  useEffect(() => {
    const fetchGame = async () => {
      try {
        setGameLoading(true);
        const response = await fetch(apiUrls.games.get(gameId));
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || 'Failed to load game');
        }

        setGame(data.game as GameRow);
      } catch (err) {
        setGameError(err instanceof Error ? err.message : 'Failed to load game');
      } finally {
        setGameLoading(false);
      }
    };

    if (gameId) {
      fetchGame();
    }
  }, [gameId]);

  // Responsive board sizing
  useEffect(() => {
    const updateSize = () => {
      const isMobile = window.innerWidth < 768;
      const padding = isMobile ? 24 : 32;
      const maxWidth = Math.min(window.innerWidth - padding, isMobile ? 400 : 520);
      const maxHeight = window.innerHeight - (isMobile ? 200 : 280);
      setBoardWidth(Math.min(maxWidth, maxHeight));
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Build chess positions for each ply
  const positions = useMemo(() => {
    if (!game?.pgn) return ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'];

    const chess = new Chess();
    const fens: string[] = [chess.fen()];

    try {
      chess.loadPgn(game.pgn);
      const history = chess.history({ verbose: true });

      // Reset and replay
      chess.reset();
      for (const move of history) {
        chess.move(move);
        fens.push(chess.fen());
      }
    } catch {
      // If PGN parsing fails, just return starting position
    }

    return fens;
  }, [game?.pgn]);

  // Current FEN based on ply
  const currentFen = useMemo(() => {
    return positions[currentPly] || positions[0];
  }, [positions, currentPly]);

  // Current move analysis
  const currentMoveAnalysis = useMemo((): MoveAnalysis | null => {
    if (currentPly === 0) return null;
    return analysisMoves.find((m) => m.ply === currentPly) || null;
  }, [analysisMoves, currentPly]);

  // Handle ply change
  const handlePlyChange = useCallback((ply: number) => {
    setCurrentPly(Math.max(0, Math.min(ply, positions.length - 1)));
  }, [positions.length]);

  // Handle flip board
  const handleFlipBoard = useCallback(() => {
    setBoardOrientation((prev) => (prev === 'white' ? 'black' : 'white'));
  }, []);

  // Get arrow annotations for the current move
  const arrows = useMemo(() => {
    if (!currentMoveAnalysis) return [];

    const arrowList: { startSquare: string; endSquare: string; color: string }[] = [];

    // Show best move arrow (green)
    if (currentMoveAnalysis.best_move_uci && currentMoveAnalysis.best_move_uci !== currentMoveAnalysis.played_move_uci) {
      const from = currentMoveAnalysis.best_move_uci.slice(0, 2);
      const to = currentMoveAnalysis.best_move_uci.slice(2, 4);
      arrowList.push({ startSquare: from, endSquare: to, color: 'rgba(34, 197, 94, 0.7)' });
    }

    return arrowList;
  }, [currentMoveAnalysis]);

  const themeColors = BOARD_THEMES[boardTheme];

  // Loading state
  if (gameLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (gameError || !game) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">{t('error')}</h1>
          <p className="text-muted-foreground mb-4">{gameError || t('gameNotFound')}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('goBack')}
          </Button>
        </main>
      </div>
    );
  }

  // Game not finished
  if (game.status !== 'finished') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">{t('gameNotFinished')}</h1>
          <p className="text-muted-foreground mb-4">
            {t('gameNotFinishedDesc')}
          </p>
          <Button onClick={() => router.push(`/game/${gameId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToGame')}
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/game/${gameId}`)}>
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                {t('title')}
              </h1>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                <span>{new Date(game.created_at).toLocaleDateString()}</span>
                {game.game_mode && (
                  <Badge variant="secondary" className="text-xs">
                    {game.game_mode}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {game.result}
                </Badge>
              </div>
            </div>
          </div>

          {/* Analysis status badge */}
          {analysisStatus !== 'done' && (
            <Badge
              variant={
                analysisStatus === 'processing'
                  ? 'default'
                  : analysisStatus === 'pending'
                    ? 'secondary'
                    : 'outline'
              }
              className="text-xs"
            >
              {analysisStatus === 'processing' && (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              )}
              {analysisStatus === 'pending' && <Clock className="h-3 w-3 mr-1" />}
              {analysisStatus === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
              {analysisStatus}
              {progress && ` (${progress.percentage}%)`}
            </Badge>
          )}
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Left column - Board and navigation */}
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              {/* Player cards */}
              <div className="w-full max-w-[540px] grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                <ReviewPlayerCard
                  color="white"
                  username={game.white?.username || 'White'}
                  displayName={game.white?.display_name || undefined}
                  avatarUrl={game.white?.avatar_url || undefined}
                  analysis={analysis?.white}
                />
                <ReviewPlayerCard
                  color="black"
                  username={game.black?.username || 'Black'}
                  displayName={game.black?.display_name || undefined}
                  avatarUrl={game.black?.avatar_url || undefined}
                  analysis={analysis?.black}
                />
              </div>

              {/* Board with evaluation bar */}
              <div className="flex gap-1.5 sm:gap-2 items-center justify-center w-full">
                {/* Evaluation bar */}
                {currentMoveAnalysis && (
                  <EvaluationBar
                    evaluation={currentMoveAnalysis.eval_after}
                    className="h-auto"
                  />
                )}

                {/* Chess board */}
                <div style={{ width: boardWidth, height: boardWidth }} className="flex-shrink-0">
                  <Chessboard
                    options={{
                      id: 'review-board',
                      position: currentFen,
                      boardOrientation: boardOrientation,
                      allowDragging: false,
                      boardStyle: {
                        borderRadius: '4px',
                        width: `${boardWidth}px`,
                        height: `${boardWidth}px`,
                      },
                      darkSquareStyle: { backgroundColor: themeColors.dark },
                      lightSquareStyle: { backgroundColor: themeColors.light },
                      animationDurationInMs: enableAnimations ? animationSpeed : 0,
                      showAnimations: enableAnimations,
                      showNotation: true,
                      arrows: arrows,
                    }}
                  />
                </div>
              </div>

              {/* Navigation controls */}
              <div className="w-full max-w-[540px] mt-3 sm:mt-4 px-1">
                <ReviewNavigation
                  currentPly={currentPly}
                  totalPlies={positions.length - 1}
                  onPlyChange={handlePlyChange}
                  onFlipBoard={handleFlipBoard}
                />
              </div>

              {/* Accuracy chart */}
              {analysisMoves.length > 0 && (
                <div className="w-full max-w-[540px] mt-3 sm:mt-4">
                  <AccuracyChart
                    moves={analysisMoves}
                    currentPly={currentPly}
                    onMoveClick={handlePlyChange}
                  />
                </div>
              )}
            </motion.div>
          </div>

          {/* Right column - Move list and details */}
          <div className="w-full lg:w-80 lg:flex-shrink-0">
            {/* Analysis not requested state */}
            {analysisStatus === 'not_requested' && (
              <Card className="mb-4">
                <CardContent className="py-6 text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="font-semibold mb-2">{t('noAnalysisAvailable')}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('requestAnalysisDesc')}
                  </p>
                  <Button onClick={queueAnalysis} disabled={reviewLoading}>
                    {reviewLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <BarChart3 className="h-4 w-4 mr-2" />
                    )}
                    {t('analyzeGame')}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Analysis pending/processing state */}
            {(analysisStatus === 'pending' || analysisStatus === 'processing') && (
              <Card className="mb-4">
                <CardContent className="py-6 text-center">
                  <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-3" />
                  <h3 className="font-semibold mb-2">
                    {analysisStatus === 'pending' ? t('analysisQueued') : t('analyzingGame')}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {analysisStatus === 'pending'
                      ? t('analysisQueuedDesc')
                      : t('analyzingMove', { current: progress?.current_ply || 0, total: progress?.total_plies || '?' })}
                  </p>
                  {progress && (
                    <div className="w-full bg-muted rounded-full h-2 mb-4">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  )}
                  <Button variant="outline" size="sm" onClick={refreshReview}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t('refresh')}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Analysis failed state */}
            {analysisStatus === 'failed' && (
              <Card className="mb-4 border-red-500/50">
                <CardContent className="py-6 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-3" />
                  <h3 className="font-semibold mb-2">{t('analysisFailed')}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {reviewError || t('analysisErrorDesc')}
                  </p>
                  <Button onClick={queueAnalysis}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t('retryAnalysis')}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Analysis done - show move list and details */}
            {analysisStatus === 'done' && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{t('moves')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="moves" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="moves">{t('moveList')}</TabsTrigger>
                      <TabsTrigger value="details">{t('details')}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="moves" className="mt-4">
                      <ReviewMoveTimeline
                        moves={analysisMoves}
                        currentPly={currentPly}
                        onMoveClick={handlePlyChange}
                        className="border rounded-lg"
                      />
                    </TabsContent>

                    <TabsContent value="details" className="mt-4">
                      <MoveDetailPanel move={currentMoveAnalysis} />
                    </TabsContent>
                  </Tabs>

                  {/* Engine info */}
                  {analysis && (
                    <>
                      <Separator className="my-4" />
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>
                          {t('engine', { name: analysis.engine_name, version: analysis.engine_version })}
                        </div>
                        <div>{t('depth', { depth: analysis.analysis_depth })}</div>
                        {analysis.completed_at && (
                          <div>
                            {t('analyzed', { date: new Date(analysis.completed_at).toLocaleDateString() })}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
