'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiUrls } from '@/lib/api/urls';
import { getSupabaseClient } from '@/lib/supabase/client';
import type {
  AnalysisStatus,
  GameReviewResponse,
  QueueAnalysisResponse,
  MoveAnalysis,
  GameAnalysisSummary,
} from '@/types/chess';

interface UseGameReviewOptions {
  pollInterval?: number; // ms, default 3000
  autoQueue?: boolean; // automatically queue analysis if not requested
}

interface UseGameReviewReturn {
  // Data
  status: AnalysisStatus;
  analysis: GameAnalysisSummary | null;
  moves: MoveAnalysis[];
  progress: { current_ply: number; total_plies: number; percentage: number } | null;

  // State
  isLoading: boolean;
  error: string | null;

  // Actions
  queueAnalysis: () => Promise<void>;
  refreshReview: () => Promise<void>;
}

export function useGameReview(
  gameId: string | null,
  options: UseGameReviewOptions = {}
): UseGameReviewReturn {
  const { pollInterval = 3000, autoQueue = false } = options;

  const [status, setStatus] = useState<AnalysisStatus>('not_requested');
  const [analysis, setAnalysis] = useState<GameAnalysisSummary | null>(null);
  const [moves, setMoves] = useState<MoveAnalysis[]>([]);
  const [progress, setProgress] = useState<{ current_ply: number; total_plies: number; percentage: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the review data
  const fetchReview = useCallback(async () => {
    if (!gameId) return;

    try {
      const response = await fetch(apiUrls.gameReview.getReview(gameId));
      const data: GameReviewResponse = await response.json();

      if (!response.ok) {
        throw new Error((data as { error?: string }).error || 'Failed to fetch review');
      }

      setStatus(data.status);
      setError(null);

      if (data.status === 'done' && data.analysis) {
        setAnalysis(data.analysis);
        setMoves(data.moves || []);
        setProgress(null);
      } else if (data.status === 'processing' && data.progress) {
        setProgress(data.progress);
      } else if (data.status === 'pending') {
        setProgress(null);
      } else if (data.status === 'not_requested') {
        setAnalysis(null);
        setMoves([]);
        setProgress(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch review');
    }
  }, [gameId]);

  // Queue analysis for the game
  const queueAnalysis = useCallback(async () => {
    if (!gameId) return;

    try {
      setIsLoading(true);
      const response = await fetch(apiUrls.gameReview.queue(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: gameId }),
      });

      const data: QueueAnalysisResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to queue analysis');
      }

      if (data.status) {
        setStatus(data.status);
      }

      // Refresh to get latest data
      await fetchReview();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to queue analysis');
    } finally {
      setIsLoading(false);
    }
  }, [gameId, fetchReview]);

  // Refresh review data
  const refreshReview = useCallback(async () => {
    setIsLoading(true);
    await fetchReview();
    setIsLoading(false);
  }, [fetchReview]);

  // Initial fetch
  useEffect(() => {
    if (!gameId) {
      setIsLoading(false);
      return;
    }

    const init = async () => {
      setIsLoading(true);
      await fetchReview();
      setIsLoading(false);
    };

    init();
  }, [gameId, fetchReview]);

  // Auto-queue if not requested and autoQueue is enabled
  useEffect(() => {
    if (autoQueue && status === 'not_requested' && !isLoading && gameId) {
      queueAnalysis();
    }
  }, [autoQueue, status, isLoading, gameId, queueAnalysis]);

  // Poll for updates when status is pending or processing
  useEffect(() => {
    if (!gameId) return;
    if (status !== 'pending' && status !== 'processing') return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(apiUrls.gameReview.status(gameId));
        const data = await response.json();

        if (response.ok) {
          setStatus(data.status);

          if (data.progress) {
            setProgress(data.progress);
          }

          // If done, fetch full review
          if (data.status === 'done') {
            await fetchReview();
          }
        }
      } catch {
        // Silently ignore polling errors
      }
    }, pollInterval);

    return () => clearInterval(interval);
  }, [gameId, status, pollInterval, fetchReview]);

  // Subscribe to realtime updates for faster notifications
  useEffect(() => {
    if (!gameId) return;
    if (status !== 'pending' && status !== 'processing') return;

    const supabase = getSupabaseClient();
    const channel = supabase
      .channel(`game_analysis:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_analysis',
          filter: `game_id=eq.${gameId}`,
        },
        async (payload: { new?: Record<string, unknown> }) => {
          const newStatus = (payload.new as { status?: string } | undefined)?.status as AnalysisStatus | undefined;
          if (newStatus) {
            setStatus(newStatus);
            if (newStatus === 'done') {
              await fetchReview();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, status, fetchReview]);

  return {
    status,
    analysis,
    moves,
    progress,
    isLoading,
    error,
    queueAnalysis,
    refreshReview,
  };
}
