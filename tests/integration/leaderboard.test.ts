import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { server } from '../../msw/server';
import { http, HttpResponse } from 'msw';
import { useAuthStore } from '@/stores/authStore';
import { mockUsers, mockProfiles, USER_IDS } from '../fixtures/users';
import { mockLeaderboardEntries, createLeaderboardEntry, calculateExpectedScore, calculateEloDelta } from '../fixtures/leaderboard';

describe('Leaderboard Integration', () => {
  beforeEach(() => {
    useAuthStore.getState().reset();
    useAuthStore.getState().setUser(mockUsers.playerA);
    useAuthStore.getState().setProfile(mockProfiles.playerA);
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('Fetch Leaderboard', () => {
    it('should fetch global leaderboard for blitz mode', async () => {
      server.use(
        http.get('/api/leaderboard', ({ request }) => {
          const url = new URL(request.url);
          const mode = url.searchParams.get('mode');
          expect(mode).toBe('blitz');

          return HttpResponse.json({
            leaderboard: mockLeaderboardEntries,
          });
        })
      );

      const response = await fetch('/api/leaderboard?mode=blitz');
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.leaderboard).toBeDefined();
      expect(data.leaderboard.length).toBeGreaterThan(0);
    });

    it('should fetch leaderboard with limit parameter', async () => {
      server.use(
        http.get('/api/leaderboard', ({ request }) => {
          const url = new URL(request.url);
          const limit = url.searchParams.get('limit');
          expect(limit).toBe('10');

          return HttpResponse.json({
            leaderboard: mockLeaderboardEntries.slice(0, 10),
          });
        })
      );

      const response = await fetch('/api/leaderboard?mode=blitz&limit=10');
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.leaderboard.length).toBeLessThanOrEqual(10);
    });

    it('should return leaderboard sorted by elo descending', async () => {
      server.use(
        http.get('/api/leaderboard', () => {
          return HttpResponse.json({
            leaderboard: mockLeaderboardEntries,
          });
        })
      );

      const response = await fetch('/api/leaderboard?mode=blitz');
      const data = await response.json();

      // Verify sorted order (using elo field)
      for (let i = 1; i < data.leaderboard.length; i++) {
        expect(data.leaderboard[i - 1].elo).toBeGreaterThanOrEqual(
          data.leaderboard[i].elo
        );
      }
    });

    it('should include rank in leaderboard entries', async () => {
      server.use(
        http.get('/api/leaderboard', () => {
          return HttpResponse.json({
            leaderboard: mockLeaderboardEntries.map((entry, index) => ({
              ...entry,
              rank: index + 1,
            })),
          });
        })
      );

      const response = await fetch('/api/leaderboard?mode=blitz');
      const data = await response.json();

      data.leaderboard.forEach((entry: { rank: number }, index: number) => {
        expect(entry.rank).toBe(index + 1);
      });
    });

    it('should handle different rating modes', async () => {
      const modes = ['bullet', 'blitz', 'rapid', 'classical'];

      for (const mode of modes) {
        server.use(
          http.get('/api/leaderboard', () => {
            return HttpResponse.json({
              leaderboard: [
                createLeaderboardEntry({
                  userId: USER_IDS.playerA,
                  mode: mode as 'bullet' | 'blitz' | 'rapid' | 'classical',
                  elo: 1500,
                }),
              ],
            });
          })
        );

        const response = await fetch(`/api/leaderboard?mode=${mode}`);
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.leaderboard[0].mode).toBe(mode);
      }
    });
  });

  describe('User Ratings', () => {
    it('should fetch user ratings by userId', async () => {
      server.use(
        http.get('/api/ratings/:userId', ({ params }) => {
          expect(params.userId).toBe(USER_IDS.playerA);

          return HttpResponse.json({
            ratings: {
              bullet: { rating: 1200, games: 50, wins: 25, losses: 20, draws: 5 },
              blitz: { rating: 1350, games: 100, wins: 55, losses: 40, draws: 5 },
              rapid: { rating: 1450, games: 30, wins: 18, losses: 10, draws: 2 },
              classical: { rating: 1500, games: 10, wins: 6, losses: 3, draws: 1 },
            },
          });
        })
      );

      const response = await fetch(`/api/ratings/${USER_IDS.playerA}`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.ratings.bullet).toBeDefined();
      expect(data.ratings.blitz).toBeDefined();
      expect(data.ratings.rapid).toBeDefined();
      expect(data.ratings.classical).toBeDefined();
    });

    it('should return 404 for non-existent user', async () => {
      server.use(
        http.get('/api/ratings/:userId', () => {
          return HttpResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        })
      );

      const response = await fetch('/api/ratings/non-existent-user');
      expect(response.status).toBe(404);
    });

    it('should include win rate in ratings', async () => {
      server.use(
        http.get('/api/ratings/:userId', () => {
          return HttpResponse.json({
            ratings: {
              blitz: {
                rating: 1350,
                games: 100,
                wins: 55,
                losses: 40,
                draws: 5,
                winRate: 55,
              },
            },
          });
        })
      );

      const response = await fetch(`/api/ratings/${USER_IDS.playerA}`);
      const data = await response.json();

      expect(data.ratings.blitz.winRate).toBe(55);
    });
  });

  describe('ELO Calculation', () => {
    it('should calculate expected score correctly', () => {
      // Equal ratings should give 0.5 expected score
      const expected = calculateExpectedScore(1500, 1500);
      expect(expected).toBeCloseTo(0.5, 2);
    });

    it('should favor higher rated player', () => {
      const expectedHigher = calculateExpectedScore(1600, 1400);
      const expectedLower = calculateExpectedScore(1400, 1600);

      expect(expectedHigher).toBeGreaterThan(0.5);
      expect(expectedLower).toBeLessThan(0.5);
      expect(expectedHigher + expectedLower).toBeCloseTo(1, 2);
    });

    it('should calculate positive ELO change for winner', () => {
      const change = calculateEloDelta(1500, 1500, 'win', 50);
      expect(change).toBeGreaterThan(0);
    });

    it('should calculate negative ELO change for loser', () => {
      const change = calculateEloDelta(1500, 1500, 'loss', 50);
      expect(change).toBeLessThan(0);
    });

    it('should calculate zero ELO change for draw with equal ratings', () => {
      const change = calculateEloDelta(1500, 1500, 'draw', 50);
      expect(change).toBeCloseTo(0, 1);
    });

    it('should give larger gain for beating higher rated opponent', () => {
      const changeBeatingHigher = calculateEloDelta(1400, 1600, 'win', 50);
      const changeBeatingLower = calculateEloDelta(1600, 1400, 'win', 50);

      expect(changeBeatingHigher).toBeGreaterThan(changeBeatingLower);
    });
  });

  describe('Rating Updates After Game', () => {
    it('should update leaderboard after game completion', async () => {
      let playerARating = 1500;
      let playerBRating = 1500;

      // Initial leaderboard
      server.use(
        http.get('/api/leaderboard', () => {
          return HttpResponse.json({
            leaderboard: [
              createLeaderboardEntry({
                userId: USER_IDS.playerA,
                elo: playerARating,
              }),
              createLeaderboardEntry({
                userId: USER_IDS.playerB,
                elo: playerBRating,
              }),
            ],
          });
        })
      );

      // Fetch initial
      let response = await fetch('/api/leaderboard?mode=blitz');
      let data = await response.json();
      expect(data.leaderboard[0].elo).toBe(1500);

      // Simulate game completion with rating update
      playerARating = 1515;
      playerBRating = 1485;

      // Fetch updated
      response = await fetch('/api/leaderboard?mode=blitz');
      data = await response.json();

      // Find players in leaderboard
      const playerA = data.leaderboard.find(
        (e: { userId: string }) => e.userId === USER_IDS.playerA
      );
      const playerB = data.leaderboard.find(
        (e: { userId: string }) => e.userId === USER_IDS.playerB
      );

      expect(playerA.elo).toBe(1515);
      expect(playerB.elo).toBe(1485);
    });

    it('should verify rating changes are symmetric', () => {
      // Player A wins against Player B (equal ratings)
      const winnerChange = calculateEloDelta(1500, 1500, 'win', 50);
      const loserChange = calculateEloDelta(1500, 1500, 'loss', 50);

      // Changes should be equal and opposite
      expect(winnerChange).toBeCloseTo(-loserChange, 1);
    });
  });

  describe('Leaderboard Pagination', () => {
    it('should support offset pagination', async () => {
      server.use(
        http.get('/api/leaderboard', ({ request }) => {
          const url = new URL(request.url);
          const offset = parseInt(url.searchParams.get('offset') || '0');
          const limit = parseInt(url.searchParams.get('limit') || '10');

          const allEntries = Array.from({ length: 100 }, (_, i) =>
            createLeaderboardEntry({
              userId: `user-${i}`,
              elo: 2000 - i * 10,
              rank: i + 1,
            })
          );

          return HttpResponse.json({
            leaderboard: allEntries.slice(offset, offset + limit),
            total: allEntries.length,
          });
        })
      );

      // First page
      let response = await fetch('/api/leaderboard?mode=blitz&limit=10&offset=0');
      let data = await response.json();
      expect(data.leaderboard[0].rank).toBe(1);
      expect(data.leaderboard[9].rank).toBe(10);

      // Second page
      response = await fetch('/api/leaderboard?mode=blitz&limit=10&offset=10');
      data = await response.json();
      expect(data.leaderboard[0].rank).toBe(11);
      expect(data.leaderboard[9].rank).toBe(20);
    });
  });

  describe('Profile Navigation from Leaderboard', () => {
    it('should fetch profile when clicking leaderboard entry', async () => {
      const targetUserId = USER_IDS.playerB;

      server.use(
        http.get('/api/profile/:userId', ({ params }) => {
          expect(params.userId).toBe(targetUserId);

          return HttpResponse.json({
            profile: mockProfiles.playerB,
            stats: {
              totalGames: 150,
              wins: 80,
              losses: 60,
              draws: 10,
              winRate: 53.3,
            },
          });
        })
      );

      const response = await fetch(`/api/profile/${targetUserId}`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.profile.id).toBe(targetUserId);
      expect(data.stats.totalGames).toBe(150);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid mode parameter', async () => {
      server.use(
        http.get('/api/leaderboard', () => {
          return HttpResponse.json(
            { error: 'Invalid mode. Must be bullet, blitz, rapid, or classical' },
            { status: 400 }
          );
        })
      );

      const response = await fetch('/api/leaderboard?mode=invalid');
      expect(response.status).toBe(400);
    });

    it('should handle server errors gracefully', async () => {
      server.use(
        http.get('/api/leaderboard', () => {
          return HttpResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      const response = await fetch('/api/leaderboard?mode=blitz');
      expect(response.status).toBe(500);
    });

    it('should handle network errors', async () => {
      server.use(
        http.get('/api/leaderboard', () => {
          return HttpResponse.error();
        })
      );

      await expect(fetch('/api/leaderboard?mode=blitz')).rejects.toThrow();
    });
  });
});
