import { describe, it, expect } from 'vitest';
import {
  LeaderboardResponseSchema,
  LeaderboardEntrySchema,
  ErrorResponseSchema,
} from './schemas';

describe('Leaderboard API Contract Tests', () => {
  describe('GET /api/leaderboard', () => {
    describe('Response Schema', () => {
      it('should validate valid leaderboard response', () => {
        const validResponse = {
          leaderboard: [
            {
              userId: 'user-1',
              mode: 'blitz',
              elo: 1500,
              gamesPlayed: 50,
              wins: 30,
              losses: 15,
              draws: 5,
              username: 'player1',
              displayName: 'Player One',
              avatarUrl: 'https://example.com/avatar.png',
              rank: 1,
            },
            {
              userId: 'user-2',
              mode: 'blitz',
              elo: 1450,
              gamesPlayed: 40,
              wins: 20,
              losses: 15,
              draws: 5,
              username: 'player2',
              displayName: null,
              avatarUrl: null,
              rank: 2,
            },
          ],
        };

        const result = LeaderboardResponseSchema.safeParse(validResponse);
        expect(result.success).toBe(true);
      });

      it('should validate empty leaderboard', () => {
        const validResponse = {
          leaderboard: [],
        };

        const result = LeaderboardResponseSchema.safeParse(validResponse);
        expect(result.success).toBe(true);
      });

      it('should validate bullet mode leaderboard', () => {
        const validResponse = {
          leaderboard: [
            {
              userId: 'user-1',
              mode: 'bullet',
              elo: 1200,
              gamesPlayed: 100,
              wins: 60,
              losses: 35,
              draws: 5,
              username: 'bulletmaster',
              rank: 1,
            },
          ],
        };

        const result = LeaderboardResponseSchema.safeParse(validResponse);
        expect(result.success).toBe(true);
      });

      it('should validate rapid mode leaderboard', () => {
        const validResponse = {
          leaderboard: [
            {
              userId: 'user-1',
              mode: 'rapid',
              elo: 1800,
              gamesPlayed: 25,
              wins: 15,
              losses: 8,
              draws: 2,
              username: 'rapidking',
              rank: 1,
            },
          ],
        };

        const result = LeaderboardResponseSchema.safeParse(validResponse);
        expect(result.success).toBe(true);
      });

      it('should validate classical mode leaderboard', () => {
        const validResponse = {
          leaderboard: [
            {
              userId: 'user-1',
              mode: 'classical',
              elo: 2000,
              gamesPlayed: 10,
              wins: 7,
              losses: 2,
              draws: 1,
              username: 'classicchamp',
              rank: 1,
            },
          ],
        };

        const result = LeaderboardResponseSchema.safeParse(validResponse);
        expect(result.success).toBe(true);
      });
    });

    describe('Entry Schema Validation', () => {
      it('should require userId', () => {
        const invalidEntry = {
          mode: 'blitz',
          elo: 1500,
          gamesPlayed: 50,
          wins: 30,
          losses: 15,
          draws: 5,
          username: 'player1',
          rank: 1,
        };

        const result = LeaderboardEntrySchema.safeParse(invalidEntry);
        expect(result.success).toBe(false);
      });

      it('should require mode', () => {
        const invalidEntry = {
          userId: 'user-1',
          elo: 1500,
          gamesPlayed: 50,
          wins: 30,
          losses: 15,
          draws: 5,
          username: 'player1',
          rank: 1,
        };

        const result = LeaderboardEntrySchema.safeParse(invalidEntry);
        expect(result.success).toBe(false);
      });

      it('should reject invalid mode', () => {
        const invalidEntry = {
          userId: 'user-1',
          mode: 'hyperbullet', // Not a valid mode
          elo: 1500,
          gamesPlayed: 50,
          wins: 30,
          losses: 15,
          draws: 5,
          username: 'player1',
          rank: 1,
        };

        const result = LeaderboardEntrySchema.safeParse(invalidEntry);
        expect(result.success).toBe(false);
      });

      it('should require elo to be a number', () => {
        const invalidEntry = {
          userId: 'user-1',
          mode: 'blitz',
          elo: '1500', // Should be number
          gamesPlayed: 50,
          wins: 30,
          losses: 15,
          draws: 5,
          username: 'player1',
          rank: 1,
        };

        const result = LeaderboardEntrySchema.safeParse(invalidEntry);
        expect(result.success).toBe(false);
      });

      it('should require rank to be a number', () => {
        const invalidEntry = {
          userId: 'user-1',
          mode: 'blitz',
          elo: 1500,
          gamesPlayed: 50,
          wins: 30,
          losses: 15,
          draws: 5,
          username: 'player1',
          rank: 'first', // Should be number
        };

        const result = LeaderboardEntrySchema.safeParse(invalidEntry);
        expect(result.success).toBe(false);
      });
    });

    describe('Error Responses', () => {
      it('should validate 400 invalid mode error', () => {
        const errorResponse = {
          error: 'Invalid mode',
        };

        const result = ErrorResponseSchema.safeParse(errorResponse);
        expect(result.success).toBe(true);
      });

      it('should validate 500 fetch error', () => {
        const errorResponse = {
          error: 'Failed to fetch leaderboard',
        };

        const result = ErrorResponseSchema.safeParse(errorResponse);
        expect(result.success).toBe(true);
      });
    });
  });
});
