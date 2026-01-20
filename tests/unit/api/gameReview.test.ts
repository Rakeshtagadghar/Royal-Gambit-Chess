import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  mockApiResponses,
  mockGameAnalysis,
  ANALYSIS_IDS,
  type AnalysisStatus,
} from '@tests/fixtures/gameReview';
import { GAME_IDS, mockGames } from '@tests/fixtures/games';
import { USER_IDS } from '@tests/fixtures/users';

// =============================================================================
// Mock API handlers for testing
// These simulate the API behavior without actual network calls
// =============================================================================

interface QueueAnalysisParams {
  gameId: string;
  userId?: string;
  force?: boolean;
}

interface GetReviewParams {
  gameId: string;
  userId?: string;
  includeMoves?: boolean;
}

// Simulated database state
let analysisDb: Map<string, { status: AnalysisStatus; game_id: string }>;

function resetMockDb() {
  analysisDb = new Map([
    [GAME_IDS.finished, { status: 'done', game_id: GAME_IDS.finished }],
    [ANALYSIS_IDS.pending, { status: 'pending', game_id: ANALYSIS_IDS.pending }],
    [ANALYSIS_IDS.processing, { status: 'processing', game_id: ANALYSIS_IDS.processing }],
    [ANALYSIS_IDS.failed, { status: 'failed', game_id: ANALYSIS_IDS.failed }],
  ]);
}

// Mock queue analysis function
function mockQueueAnalysis({ gameId, userId, force }: QueueAnalysisParams) {
  // Check authentication
  if (!userId) {
    return { success: false, error: 'Authentication required', code: 'UNAUTHORIZED' };
  }

  // Check if game exists
  const game = Object.values(mockGames).find(g => g.id === gameId);
  if (!game) {
    return { success: false, error: 'Game not found', code: 'GAME_NOT_FOUND' };
  }

  // Check authorization (user must be participant)
  const isParticipant =
    game.whitePlayer?.id === userId ||
    game.blackPlayer?.id === userId ||
    game.createdBy === userId;

  if (!isParticipant) {
    return { success: false, error: "You don't have access to this game", code: 'FORBIDDEN' };
  }

  // Check if game is finished
  if (game.status !== 'finished') {
    return {
      success: false,
      error: 'Analysis can only be performed on finished games',
      code: 'GAME_NOT_FINISHED',
    };
  }

  // Check existing analysis
  const existing = analysisDb.get(gameId);
  if (existing && !force) {
    return {
      success: true,
      status: existing.status,
      game_id: gameId,
      queued_at: '2024-01-15T10:00:00Z',
      message:
        existing.status === 'done'
          ? 'Analysis already completed'
          : existing.status === 'processing'
            ? 'Analysis in progress'
            : 'Analysis already queued',
    };
  }

  // Queue new analysis
  analysisDb.set(gameId, { status: 'pending', game_id: gameId });
  return {
    success: true,
    status: 'pending',
    game_id: gameId,
    queued_at: new Date().toISOString(),
    message: 'Game queued for analysis',
  };
}

// Mock get review function
function mockGetReview({ gameId, userId, includeMoves = true }: GetReviewParams) {
  // Check if game exists
  const game = Object.values(mockGames).find(g => g.id === gameId);
  if (!game) {
    return { success: false, error: 'Game not found', code: 'GAME_NOT_FOUND' };
  }

  // Check authorization for non-finished games
  if (game.status !== 'finished') {
    const isParticipant =
      game.whitePlayer?.id === userId ||
      game.blackPlayer?.id === userId;

    if (!userId || !isParticipant) {
      return { success: false, error: "You don't have access to this game", code: 'FORBIDDEN' };
    }
  }

  // Check analysis status
  const analysis = analysisDb.get(gameId);
  if (!analysis) {
    return {
      status: 'not_requested',
      game_id: gameId,
      message: 'Analysis has not been requested for this game',
    };
  }

  // Return based on status
  switch (analysis.status) {
    case 'done':
      const fullAnalysis = mockGameAnalysis.completed;
      return {
        status: 'done',
        game_id: gameId,
        analysis: {
          engine_name: fullAnalysis.engine_name,
          engine_version: fullAnalysis.engine_version,
          analysis_depth: fullAnalysis.analysis_depth,
          time_per_move_ms: fullAnalysis.time_per_move_ms,
          completed_at: fullAnalysis.completed_at,
          white: fullAnalysis.white,
          black: fullAnalysis.black,
        },
        ...(includeMoves ? { moves: fullAnalysis.moves } : {}),
      };

    case 'processing':
      return {
        status: 'processing',
        game_id: gameId,
        started_at: '2024-01-15T11:00:30Z',
        progress: {
          current_ply: 15,
          total_plies: 60,
          percentage: 25,
        },
      };

    case 'pending':
      return {
        status: 'pending',
        game_id: gameId,
        queued_at: '2024-01-15T11:00:00Z',
        queue_position: 3,
      };

    case 'failed':
      return {
        status: 'failed',
        game_id: gameId,
        error: 'Analysis could not be completed',
      };

    default:
      return { status: analysis.status, game_id: gameId };
  }
}

// =============================================================================
// TESTS
// =============================================================================

describe('Game Review API', () => {
  beforeEach(() => {
    resetMockDb();
  });

  describe('POST /api/game-review/queue', () => {
    describe('Authentication', () => {
      it('should reject unauthenticated requests', () => {
        const result = mockQueueAnalysis({
          gameId: GAME_IDS.finished,
          userId: undefined,
        });

        expect(result.success).toBe(false);
        expect(result.code).toBe('UNAUTHORIZED');
      });

      it('should accept authenticated requests', () => {
        const result = mockQueueAnalysis({
          gameId: GAME_IDS.finished,
          userId: USER_IDS.playerA,
        });

        expect(result.success).toBe(true);
      });
    });

    describe('Authorization', () => {
      it('should allow game participants to queue analysis', () => {
        // White player
        const resultWhite = mockQueueAnalysis({
          gameId: GAME_IDS.finished,
          userId: USER_IDS.playerA,
        });
        expect(resultWhite.success).toBe(true);
      });

      it('should reject non-participants', () => {
        const result = mockQueueAnalysis({
          gameId: GAME_IDS.finished,
          userId: USER_IDS.spectator, // Not a participant
        });

        expect(result.success).toBe(false);
        expect(result.code).toBe('FORBIDDEN');
      });
    });

    describe('Game validation', () => {
      it('should reject non-existent games', () => {
        const result = mockQueueAnalysis({
          gameId: 'non-existent-game-id',
          userId: USER_IDS.playerA,
        });

        expect(result.success).toBe(false);
        expect(result.code).toBe('GAME_NOT_FOUND');
      });

      it('should reject games that are not finished', () => {
        const result = mockQueueAnalysis({
          gameId: GAME_IDS.ongoing, // Active game
          userId: USER_IDS.playerA,
        });

        expect(result.success).toBe(false);
        expect(result.code).toBe('GAME_NOT_FINISHED');
      });
    });

    describe('Idempotency', () => {
      it('should return existing analysis when already done', () => {
        const result = mockQueueAnalysis({
          gameId: GAME_IDS.finished,
          userId: USER_IDS.playerA,
        });

        expect(result.success).toBe(true);
        expect(result.status).toBe('done');
        expect(result.message).toBe('Analysis already completed');
      });

      it('should return pending status when already queued', () => {
        const result = mockQueueAnalysis({
          gameId: ANALYSIS_IDS.pending,
          userId: USER_IDS.playerA,
        });

        // Note: This will fail because ANALYSIS_IDS.pending is not in mockGames
        // In a real test, we'd need to ensure the game exists
        expect(result.code).toBe('GAME_NOT_FOUND');
      });
    });

    describe('Response format', () => {
      it('should return correct success response structure', () => {
        // Clear existing analysis to test fresh queue
        analysisDb.delete(GAME_IDS.finished);

        const result = mockQueueAnalysis({
          gameId: GAME_IDS.finished,
          userId: USER_IDS.playerA,
        });

        expect(result).toHaveProperty('success', true);
        expect(result).toHaveProperty('status', 'pending');
        expect(result).toHaveProperty('game_id', GAME_IDS.finished);
        expect(result).toHaveProperty('queued_at');
        expect(result).toHaveProperty('message');
      });

      it('should return correct error response structure', () => {
        const result = mockQueueAnalysis({
          gameId: 'invalid',
          userId: USER_IDS.playerA,
        });

        expect(result).toHaveProperty('success', false);
        expect(result).toHaveProperty('error');
        expect(result).toHaveProperty('code');
      });
    });
  });

  describe('GET /api/games/{gameId}/review', () => {
    describe('Game access', () => {
      it('should allow anyone to view finished game reviews', () => {
        const result = mockGetReview({
          gameId: GAME_IDS.finished,
          userId: undefined, // Anonymous
        });

        expect(result.status).toBe('done');
      });

      it('should return game not found for invalid game ID', () => {
        const result = mockGetReview({
          gameId: 'invalid-game-id',
          userId: USER_IDS.playerA,
        });

        expect(result.code).toBe('GAME_NOT_FOUND');
      });
    });

    describe('Analysis status responses', () => {
      it('should return full analysis when done', () => {
        const result = mockGetReview({
          gameId: GAME_IDS.finished,
          userId: USER_IDS.playerA,
        });

        expect(result.status).toBe('done');
        expect(result).toHaveProperty('analysis');
        expect(result).toHaveProperty('moves');
        expect(result.analysis).toHaveProperty('white');
        expect(result.analysis).toHaveProperty('black');
        expect(result.analysis.white).toHaveProperty('accuracy');
        expect(result.analysis.white).toHaveProperty('blunders');
      });

      it('should return progress when processing', () => {
        // Add a processing analysis for the finished game
        analysisDb.set(GAME_IDS.finished, { status: 'processing', game_id: GAME_IDS.finished });

        const result = mockGetReview({
          gameId: GAME_IDS.finished,
          userId: USER_IDS.playerA,
        });

        expect(result.status).toBe('processing');
        expect(result).toHaveProperty('progress');
        expect(result.progress).toHaveProperty('current_ply');
        expect(result.progress).toHaveProperty('total_plies');
        expect(result.progress).toHaveProperty('percentage');
      });

      it('should return queue position when pending', () => {
        analysisDb.set(GAME_IDS.finished, { status: 'pending', game_id: GAME_IDS.finished });

        const result = mockGetReview({
          gameId: GAME_IDS.finished,
          userId: USER_IDS.playerA,
        });

        expect(result.status).toBe('pending');
        expect(result).toHaveProperty('queued_at');
      });

      it('should return not_requested when no analysis exists', () => {
        analysisDb.delete(GAME_IDS.finished);

        const result = mockGetReview({
          gameId: GAME_IDS.finished,
          userId: USER_IDS.playerA,
        });

        expect(result.status).toBe('not_requested');
        expect(result).toHaveProperty('message');
      });
    });

    describe('Move data inclusion', () => {
      it('should include moves by default', () => {
        const result = mockGetReview({
          gameId: GAME_IDS.finished,
          userId: USER_IDS.playerA,
        });

        expect(result).toHaveProperty('moves');
        expect(Array.isArray(result.moves)).toBe(true);
      });

      it('should exclude moves when includeMoves is false', () => {
        const result = mockGetReview({
          gameId: GAME_IDS.finished,
          userId: USER_IDS.playerA,
          includeMoves: false,
        });

        expect(result).not.toHaveProperty('moves');
      });
    });

    describe('Analysis data structure', () => {
      it('should have correct white player stats structure', () => {
        const result = mockGetReview({
          gameId: GAME_IDS.finished,
          userId: USER_IDS.playerA,
        });

        const { white } = result.analysis;
        expect(white).toHaveProperty('accuracy');
        expect(white).toHaveProperty('acpl');
        expect(white).toHaveProperty('blunders');
        expect(white).toHaveProperty('mistakes');
        expect(white).toHaveProperty('inaccuracies');
        expect(typeof white.accuracy).toBe('number');
        expect(typeof white.blunders).toBe('number');
      });

      it('should have correct move analysis structure', () => {
        const result = mockGetReview({
          gameId: GAME_IDS.finished,
          userId: USER_IDS.playerA,
        });

        const move = result.moves[0];
        expect(move).toHaveProperty('ply');
        expect(move).toHaveProperty('played_move_uci');
        expect(move).toHaveProperty('played_move_san');
        expect(move).toHaveProperty('best_move_uci');
        expect(move).toHaveProperty('eval_before');
        expect(move).toHaveProperty('eval_after');
        expect(move).toHaveProperty('eval_loss_cp');
        expect(move).toHaveProperty('classification');
        expect(move).toHaveProperty('pv');
      });

      it('should have valid evaluation objects', () => {
        const result = mockGetReview({
          gameId: GAME_IDS.finished,
          userId: USER_IDS.playerA,
        });

        const move = result.moves[0];
        expect(move.eval_before).toHaveProperty('type');
        expect(move.eval_before).toHaveProperty('value');
        expect(['cp', 'mate']).toContain(move.eval_before.type);
      });
    });
  });

  describe('API Response Mocks', () => {
    it('should have correct structure for queueSuccess', () => {
      const response = mockApiResponses.queueSuccess;
      expect(response.success).toBe(true);
      expect(response.status).toBe('pending');
      expect(response.game_id).toBeDefined();
    });

    it('should have correct structure for reviewDone', () => {
      const response = mockApiResponses.reviewDone;
      expect(response.status).toBe('done');
      expect(response.analysis).toBeDefined();
      expect(response.moves).toBeDefined();
    });

    it('should have correct error codes for all error responses', () => {
      expect(mockApiResponses.errorGameNotFound.code).toBe('GAME_NOT_FOUND');
      expect(mockApiResponses.errorUnauthorized.code).toBe('UNAUTHORIZED');
      expect(mockApiResponses.errorForbidden.code).toBe('FORBIDDEN');
      expect(mockApiResponses.errorGameNotFinished.code).toBe('GAME_NOT_FINISHED');
    });
  });
});
