import { describe, it, expect } from 'vitest';
import {
  CreateGameRequestSchema,
  CreateGameResponseSchema,
  MoveRequestSchema,
  MoveResponseSchema,
  OngoingGamesResponseSchema,
  ResignResponseSchema,
  ErrorResponseSchema,
} from './schemas';

describe('Games API Contract Tests', () => {
  describe('POST /api/games/create', () => {
    describe('Request Schema', () => {
      it('should validate valid create game request', () => {
        const validRequest = {
          mode: 'pvp',
          colorPreference: 'white',
          timeControl: { baseMs: 300000, incrementMs: 0 },
        };

        const result = CreateGameRequestSchema.safeParse(validRequest);
        expect(result.success).toBe(true);
      });

      it('should validate bot mode request', () => {
        const validRequest = {
          mode: 'bot',
          colorPreference: 'random',
          timeControl: { baseMs: 600000, incrementMs: 5000 },
        };

        const result = CreateGameRequestSchema.safeParse(validRequest);
        expect(result.success).toBe(true);
      });

      it('should reject invalid mode', () => {
        const invalidRequest = {
          mode: 'invalid',
          colorPreference: 'white',
          timeControl: { baseMs: 300000, incrementMs: 0 },
        };

        const result = CreateGameRequestSchema.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });

      it('should reject invalid color preference', () => {
        const invalidRequest = {
          mode: 'pvp',
          colorPreference: 'blue',
          timeControl: { baseMs: 300000, incrementMs: 0 },
        };

        const result = CreateGameRequestSchema.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });

      it('should reject negative time control values', () => {
        const invalidRequest = {
          mode: 'pvp',
          colorPreference: 'white',
          timeControl: { baseMs: -1000, incrementMs: 0 },
        };

        const result = CreateGameRequestSchema.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });

      it('should reject missing required fields', () => {
        const invalidRequest = {
          mode: 'pvp',
          // missing colorPreference and timeControl
        };

        const result = CreateGameRequestSchema.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });
    });

    describe('Response Schema', () => {
      it('should validate valid create game response', () => {
        const validResponse = {
          gameId: 'game-123',
          joinUrl: '/game/game-123',
        };

        const result = CreateGameResponseSchema.safeParse(validResponse);
        expect(result.success).toBe(true);
      });

      it('should reject response without gameId', () => {
        const invalidResponse = {
          joinUrl: '/game/game-123',
        };

        const result = CreateGameResponseSchema.safeParse(invalidResponse);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('POST /api/games/move', () => {
    describe('Request Schema', () => {
      it('should validate valid move request', () => {
        const validRequest = {
          gameId: 'game-123',
          move: { from: 'e2', to: 'e4' },
        };

        const result = MoveRequestSchema.safeParse(validRequest);
        expect(result.success).toBe(true);
      });

      it('should validate move with promotion', () => {
        const validRequest = {
          gameId: 'game-123',
          move: { from: 'a7', to: 'a8', promotion: 'q' },
        };

        const result = MoveRequestSchema.safeParse(validRequest);
        expect(result.success).toBe(true);
      });

      it('should reject missing gameId', () => {
        const invalidRequest = {
          move: { from: 'e2', to: 'e4' },
        };

        const result = MoveRequestSchema.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });

      it('should reject missing move', () => {
        const invalidRequest = {
          gameId: 'game-123',
        };

        const result = MoveRequestSchema.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });
    });

    describe('Response Schema', () => {
      it('should validate valid move response', () => {
        const validResponse = {
          success: true,
          gameId: 'game-123',
          move: { from: 'e2', to: 'e4' },
        };

        const result = MoveResponseSchema.safeParse(validResponse);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('GET /api/games/ongoing', () => {
    describe('Response Schema', () => {
      it('should validate valid ongoing games response', () => {
        const validResponse = {
          games: [
            {
              id: 'game-1',
              mode: 'pvp',
              status: 'active',
              whitePlayer: {
                id: 'user-1',
                username: 'player1',
                timeRemainingMs: 280000,
              },
              blackPlayer: {
                id: 'user-2',
                username: 'player2',
                timeRemainingMs: 295000,
              },
              createdAt: '2024-01-15T10:00:00Z',
            },
          ],
        };

        const result = OngoingGamesResponseSchema.safeParse(validResponse);
        expect(result.success).toBe(true);
      });

      it('should validate empty games array', () => {
        const validResponse = {
          games: [],
        };

        const result = OngoingGamesResponseSchema.safeParse(validResponse);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('POST /api/games/:id/resign', () => {
    describe('Response Schema', () => {
      it('should validate valid resign response', () => {
        const validResponse = {
          success: true,
          gameId: 'game-123',
          result: '0-1',
        };

        const result = ResignResponseSchema.safeParse(validResponse);
        expect(result.success).toBe(true);
      });

      it('should validate white resignation', () => {
        const validResponse = {
          success: true,
          gameId: 'game-123',
          result: '0-1',
        };

        const result = ResignResponseSchema.safeParse(validResponse);
        expect(result.success).toBe(true);
      });

      it('should validate black resignation', () => {
        const validResponse = {
          success: true,
          gameId: 'game-123',
          result: '1-0',
        };

        const result = ResignResponseSchema.safeParse(validResponse);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Error Responses', () => {
    it('should validate 400 error response', () => {
      const errorResponse = {
        error: 'Invalid game ID',
      };

      const result = ErrorResponseSchema.safeParse(errorResponse);
      expect(result.success).toBe(true);
    });

    it('should validate 401 error response', () => {
      const errorResponse = {
        error: 'Unauthorized',
      };

      const result = ErrorResponseSchema.safeParse(errorResponse);
      expect(result.success).toBe(true);
    });

    it('should validate 500 error response', () => {
      const errorResponse = {
        error: 'Internal server error',
      };

      const result = ErrorResponseSchema.safeParse(errorResponse);
      expect(result.success).toBe(true);
    });
  });
});
