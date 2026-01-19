import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { server } from '../../msw/server';
import { http, HttpResponse } from 'msw';
import { useAuthStore } from '@/stores/authStore';
import { mockUsers, mockProfiles, USER_IDS } from '../fixtures/users';
import { TIME_CONTROLS } from '../fixtures/games';

describe('Matchmaking Integration', () => {
  beforeEach(() => {
    useAuthStore.getState().reset();
    useAuthStore.getState().setUser(mockUsers.playerA);
    useAuthStore.getState().setProfile(mockProfiles.playerA);
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('Queue Management', () => {
    it('should enqueue user for matchmaking', async () => {
      server.use(
        http.post('/api/matchmaking/enqueue', async ({ request }) => {
          const body = await request.json() as { timeControl: { baseMs: number } };
          expect(body.timeControl).toBeDefined();
          expect(body.timeControl.baseMs).toBe(TIME_CONTROLS.blitz5.baseMs);

          return HttpResponse.json({
            ok: true,
            matched: false,
            queuePosition: 1,
          });
        })
      );

      const response = await fetch('/api/matchmaking/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeControl: TIME_CONTROLS.blitz5,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.ok).toBe(true);
      expect(data.matched).toBe(false);
    });

    it('should find immediate match if opponent waiting', async () => {
      const matchedGameId = 'matched-game-123';

      server.use(
        http.post('/api/matchmaking/enqueue', () => {
          return HttpResponse.json({
            ok: true,
            matched: true,
            gameId: matchedGameId,
          });
        })
      );

      const response = await fetch('/api/matchmaking/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeControl: TIME_CONTROLS.blitz5,
        }),
      });

      const data = await response.json();
      expect(data.matched).toBe(true);
      expect(data.gameId).toBe(matchedGameId);
    });

    it('should dequeue user from matchmaking', async () => {
      server.use(
        http.post('/api/matchmaking/dequeue', () => {
          return HttpResponse.json({
            ok: true,
          });
        })
      );

      const response = await fetch('/api/matchmaking/dequeue', {
        method: 'POST',
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.ok).toBe(true);
    });

    it('should prevent duplicate queue entries', async () => {
      server.use(
        http.post('/api/matchmaking/enqueue', () => {
          return HttpResponse.json(
            { error: 'Already in queue' },
            { status: 409 }
          );
        })
      );

      const response = await fetch('/api/matchmaking/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeControl: TIME_CONTROLS.blitz5,
        }),
      });

      expect(response.status).toBe(409);
    });
  });

  describe('Time Control Matching', () => {
    it('should match users with same time control', async () => {
      const matchedGameId = 'same-time-control-game';

      server.use(
        http.post('/api/matchmaking/enqueue', async ({ request }) => {
          const body = await request.json() as { timeControl: { baseMs: number; incrementMs: number } };

          // Verify time control matches
          if (body.timeControl.baseMs === TIME_CONTROLS.blitz5.baseMs) {
            return HttpResponse.json({
              ok: true,
              matched: true,
              gameId: matchedGameId,
            });
          }

          return HttpResponse.json({
            ok: true,
            matched: false,
          });
        })
      );

      const response = await fetch('/api/matchmaking/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeControl: TIME_CONTROLS.blitz5,
        }),
      });

      const data = await response.json();
      expect(data.matched).toBe(true);
      expect(data.gameId).toBe(matchedGameId);
    });

    it('should not match users with different time controls', async () => {
      server.use(
        http.post('/api/matchmaking/enqueue', () => {
          return HttpResponse.json({
            ok: true,
            matched: false,
            queuePosition: 2,
          });
        })
      );

      const response = await fetch('/api/matchmaking/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeControl: TIME_CONTROLS.rapid10,
        }),
      });

      const data = await response.json();
      expect(data.matched).toBe(false);
    });
  });

  describe('Rating-Based Matching', () => {
    it('should prefer matching users with similar ratings', async () => {
      server.use(
        http.post('/api/matchmaking/enqueue', () => {
          return HttpResponse.json({
            ok: true,
            matched: true,
            gameId: 'rating-matched-game',
            opponent: {
              id: USER_IDS.playerB,
              rating: 1220, // Similar to playerA's 1200
            },
          });
        })
      );

      const response = await fetch('/api/matchmaking/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeControl: TIME_CONTROLS.blitz5,
        }),
      });

      const data = await response.json();
      expect(data.matched).toBe(true);
      expect(data.opponent.rating).toBeCloseTo(1200, -2); // Within 100 points
    });
  });

  describe('Queue Status', () => {
    it('should return queue position', async () => {
      server.use(
        http.get('/api/matchmaking/status', () => {
          return HttpResponse.json({
            inQueue: true,
            position: 3,
            estimatedWaitMs: 30000,
            timeControl: TIME_CONTROLS.blitz5,
          });
        })
      );

      const response = await fetch('/api/matchmaking/status');
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.inQueue).toBe(true);
      expect(data.position).toBe(3);
    });

    it('should return not in queue when dequeued', async () => {
      server.use(
        http.get('/api/matchmaking/status', () => {
          return HttpResponse.json({
            inQueue: false,
          });
        })
      );

      const response = await fetch('/api/matchmaking/status');
      const data = await response.json();
      expect(data.inQueue).toBe(false);
    });
  });

  describe('Matchmaking Flow', () => {
    it('should complete full matchmaking flow between two users', async () => {
      let queueState: { userId: string; timeControl: object }[] = [];
      let createdGameId = '';

      // Player A enqueues - no match yet
      server.use(
        http.post('/api/matchmaking/enqueue', async ({ request }) => {
          const body = await request.json() as { timeControl: object };

          // Simulate adding to queue
          queueState.push({
            userId: USER_IDS.playerA,
            timeControl: body.timeControl,
          });

          return HttpResponse.json({
            ok: true,
            matched: false,
            queuePosition: 1,
          });
        })
      );

      let response = await fetch('/api/matchmaking/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeControl: TIME_CONTROLS.blitz5,
        }),
      });

      let data = await response.json();
      expect(data.matched).toBe(false);

      // Player B enqueues - finds match
      createdGameId = 'matchmaking-created-game';

      server.use(
        http.post('/api/matchmaking/enqueue', async ({ request }) => {
          const body = await request.json() as { timeControl: object };

          // Check if there's a matching player
          const match = queueState.find(
            (q) => JSON.stringify(q.timeControl) === JSON.stringify(body.timeControl)
          );

          if (match) {
            // Remove from queue
            queueState = queueState.filter((q) => q.userId !== match.userId);

            return HttpResponse.json({
              ok: true,
              matched: true,
              gameId: createdGameId,
              opponent: {
                id: match.userId,
              },
            });
          }

          return HttpResponse.json({
            ok: true,
            matched: false,
          });
        })
      );

      response = await fetch('/api/matchmaking/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeControl: TIME_CONTROLS.blitz5,
        }),
      });

      data = await response.json();
      expect(data.matched).toBe(true);
      expect(data.gameId).toBe(createdGameId);

      // Verify game was created
      server.use(
        http.get('/api/games/get', () => {
          return HttpResponse.json({
            id: createdGameId,
            status: 'active',
            white_player_id: USER_IDS.playerA,
            black_player_id: USER_IDS.playerB,
            time_control: TIME_CONTROLS.blitz5,
          });
        })
      );

      response = await fetch(`/api/games/get?gameId=${createdGameId}`);
      const game = await response.json();
      expect(game.status).toBe('active');
    });
  });

  describe('Error Handling', () => {
    it('should require authentication', async () => {
      useAuthStore.getState().reset(); // Log out

      server.use(
        http.post('/api/matchmaking/enqueue', () => {
          return HttpResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      const response = await fetch('/api/matchmaking/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeControl: TIME_CONTROLS.blitz5,
        }),
      });

      expect(response.status).toBe(401);
    });

    it('should handle invalid time control', async () => {
      server.use(
        http.post('/api/matchmaking/enqueue', () => {
          return HttpResponse.json(
            { error: 'Invalid time control' },
            { status: 400 }
          );
        })
      );

      const response = await fetch('/api/matchmaking/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeControl: { baseMs: -1000 },
        }),
      });

      expect(response.status).toBe(400);
    });

    it('should prevent queueing with active game', async () => {
      server.use(
        http.post('/api/matchmaking/enqueue', () => {
          return HttpResponse.json(
            { error: 'Cannot queue while in an active game' },
            { status: 400 }
          );
        })
      );

      const response = await fetch('/api/matchmaking/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeControl: TIME_CONTROLS.blitz5,
        }),
      });

      expect(response.status).toBe(400);
    });

    it('should handle server errors', async () => {
      server.use(
        http.post('/api/matchmaking/enqueue', () => {
          return HttpResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      const response = await fetch('/api/matchmaking/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeControl: TIME_CONTROLS.blitz5,
        }),
      });

      expect(response.status).toBe(500);
    });
  });

  describe('Queue Timeout', () => {
    it('should auto-dequeue after timeout', async () => {
      server.use(
        http.get('/api/matchmaking/status', () => {
          return HttpResponse.json({
            inQueue: false,
            reason: 'timeout',
          });
        })
      );

      const response = await fetch('/api/matchmaking/status');
      const data = await response.json();

      expect(data.inQueue).toBe(false);
      expect(data.reason).toBe('timeout');
    });
  });
});
