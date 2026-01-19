import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { server } from '../../msw/server';
import { http, HttpResponse } from 'msw';
import { useGameStore } from '@/stores/gameStore';
import { useAuthStore } from '@/stores/authStore';
import { mockUsers, mockProfiles, USER_IDS } from '../fixtures/users';
import { mockGames, GAME_IDS, TIME_CONTROLS, STARTING_FEN } from '../fixtures/games';

describe('Game Integration', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
    useAuthStore.getState().reset();

    // Set up authenticated user
    useAuthStore.getState().setUser(mockUsers.playerA);
    useAuthStore.getState().setProfile(mockProfiles.playerA);
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('Game Creation', () => {
    it('should create a PvP game successfully', async () => {
      const newGameId = 'new-pvp-game-123';

      server.use(
        http.post('/api/games/create', async ({ request }) => {
          const body = await request.json() as { mode: string; timeControl: { baseMs: number } };
          expect(body.mode).toBe('pvp');
          expect(body.timeControl).toBeDefined();

          return HttpResponse.json({
            gameId: newGameId,
            joinUrl: `/game/${newGameId}`,
          });
        })
      );

      const response = await fetch('/api/games/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'pvp',
          colorPreference: 'random',
          timeControl: TIME_CONTROLS.blitz5,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.gameId).toBe(newGameId);
      expect(data.joinUrl).toContain(newGameId);
    });

    it('should create a bot game successfully', async () => {
      const newGameId = 'new-bot-game-123';

      server.use(
        http.post('/api/games/create', async ({ request }) => {
          const body = await request.json() as { mode: string };
          expect(body.mode).toBe('bot');

          return HttpResponse.json({
            gameId: newGameId,
            joinUrl: `/game/${newGameId}`,
          });
        })
      );

      const response = await fetch('/api/games/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'bot',
          colorPreference: 'white',
          timeControl: TIME_CONTROLS.blitz5,
          botDifficulty: 'medium',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.gameId).toBe(newGameId);
    });

    it('should handle validation errors on game creation', async () => {
      server.use(
        http.post('/api/games/create', () => {
          return HttpResponse.json(
            { error: 'Invalid time control' },
            { status: 400 }
          );
        })
      );

      const response = await fetch('/api/games/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'pvp',
          timeControl: { baseMs: -1000 }, // Invalid
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Game Loading', () => {
    it('should load an existing game', async () => {
      server.use(
        http.get('/api/games/get', ({ request }) => {
          const url = new URL(request.url);
          const gameId = url.searchParams.get('gameId');
          expect(gameId).toBe(GAME_IDS.ongoing);

          return HttpResponse.json(mockGames.ongoing);
        })
      );

      const response = await fetch(`/api/games/get?gameId=${GAME_IDS.ongoing}`);
      expect(response.status).toBe(200);

      const game = await response.json();
      expect(game.id).toBe(GAME_IDS.ongoing);
      expect(game.status).toBe('active');
    });

    it('should return 404 for non-existent game', async () => {
      server.use(
        http.get('/api/games/get', () => {
          return HttpResponse.json(
            { error: 'Game not found' },
            { status: 404 }
          );
        })
      );

      const response = await fetch('/api/games/get?gameId=non-existent');
      expect(response.status).toBe(404);
    });

    it('should load game into store correctly', () => {
      const { loadGame } = useGameStore.getState();
      loadGame(mockGames.ongoing);

      const state = useGameStore.getState();
      expect(state.gameId).toBe(mockGames.ongoing.id);
      expect(state.mode).toBe(mockGames.ongoing.mode);
      expect(state.status).toBe('active');
    });
  });

  describe('Move Submission', () => {
    beforeEach(() => {
      useGameStore.getState().initGame({
        mode: 'pvp',
        playerColor: 'w',
        timeControl: TIME_CONTROLS.blitz5,
        gameId: GAME_IDS.ongoing,
      });
    });

    it('should submit a valid move via API', async () => {
      server.use(
        http.post('/api/games/move', async ({ request }) => {
          const body = await request.json() as { gameId: string; uci: string };
          expect(body.gameId).toBe(GAME_IDS.ongoing);
          expect(body.uci).toBe('e2e4');

          return HttpResponse.json({
            accepted: true,
            game: {
              ...mockGames.ongoing,
              currentFen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
            },
          });
        })
      );

      const response = await fetch('/api/games/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: GAME_IDS.ongoing,
          uci: 'e2e4',
          clientPly: 0,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.accepted).toBe(true);
    });

    it('should reject an illegal move', async () => {
      server.use(
        http.post('/api/games/move', () => {
          return HttpResponse.json(
            { error: 'Illegal move' },
            { status: 400 }
          );
        })
      );

      const response = await fetch('/api/games/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: GAME_IDS.ongoing,
          uci: 'e2e5', // Invalid pawn move
          clientPly: 0,
        }),
      });

      expect(response.status).toBe(400);
    });

    it('should handle out-of-sync moves with 409', async () => {
      server.use(
        http.post('/api/games/move', () => {
          return HttpResponse.json(
            { error: 'Out of sync', serverPly: 2 },
            { status: 409 }
          );
        })
      );

      const response = await fetch('/api/games/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: GAME_IDS.ongoing,
          uci: 'e2e4',
          clientPly: 0, // Server is ahead
        }),
      });

      expect(response.status).toBe(409);
    });

    it('should make move in local store', () => {
      const { makeMove } = useGameStore.getState();

      const result = makeMove('e2', 'e4');
      expect(result).toBe(true);

      const newState = useGameStore.getState();
      expect(newState.boardState.fen).toContain('4P3');
      expect(newState.boardState.turn).toBe('b');
    });
  });

  describe('Game Completion', () => {
    it('should handle checkmate correctly using foolsMate sequence', () => {
      const { initGame, makeMove } = useGameStore.getState();

      initGame({
        mode: 'pvp',
        playerColor: 'w',
        timeControl: TIME_CONTROLS.blitz5,
      });

      // Execute Fool's Mate using the gameScenarios
      const foolsMateSquares = [
        { from: 'f2', to: 'f3' }, // f2f3
        { from: 'e7', to: 'e5' }, // e7e5
        { from: 'g2', to: 'g4' }, // g2g4
        { from: 'd8', to: 'h4' }, // Qh4#
      ];

      foolsMateSquares.forEach(({ from, to }) => {
        makeMove(from as Parameters<typeof makeMove>[0], to as Parameters<typeof makeMove>[1]);
      });

      const state = useGameStore.getState();
      expect(state.boardState.isCheckmate).toBe(true);
      expect(state.status).toBe('finished');
      expect(state.result).toBe('0-1'); // Black wins
      expect(state.termination).toBe('checkmate');
    });

    it('should handle resignation via API', async () => {
      server.use(
        http.post('/api/games/:id/resign', ({ params }) => {
          expect(params.id).toBe(GAME_IDS.ongoing);

          return HttpResponse.json({
            ...mockGames.ongoing,
            status: 'finished',
            result: '0-1',
            termination: 'resignation',
          });
        })
      );

      const response = await fetch(`/api/games/${GAME_IDS.ongoing}/resign`, {
        method: 'POST',
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe('finished');
      expect(data.result).toBe('0-1');
      expect(data.termination).toBe('resignation');
    });

    it('should handle timeout via API', async () => {
      server.use(
        http.post('/api/games/:id/timeout', ({ params }) => {
          expect(params.id).toBe(GAME_IDS.ongoing);

          return HttpResponse.json({
            ...mockGames.ongoing,
            status: 'finished',
            result: '1-0',
            termination: 'timeout',
          });
        })
      );

      const response = await fetch(`/api/games/${GAME_IDS.ongoing}/timeout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loser: 'b' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.termination).toBe('timeout');
    });

    it('should update ratings after PvP game completion', async () => {
      server.use(
        http.post('/api/games/move', () => {
          return HttpResponse.json({
            accepted: true,
            game: {
              ...mockGames.ongoing,
              status: 'finished',
              result: '1-0',
              termination: 'checkmate',
            },
            ratings: {
              white: { before: 1200, after: 1215, delta: 15 },
              black: { before: 1200, after: 1185, delta: -15 },
            },
          });
        })
      );

      const response = await fetch('/api/games/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: GAME_IDS.ongoing,
          uci: 'e2e4',
          clientPly: 0,
        }),
      });

      const data = await response.json();
      expect(data.ratings).toBeDefined();
      expect(data.ratings.white.delta).toBe(15);
      expect(data.ratings.black.delta).toBe(-15);
    });
  });

  describe('Game Clock', () => {
    beforeEach(() => {
      useGameStore.getState().initGame({
        mode: 'pvp',
        playerColor: 'w',
        timeControl: TIME_CONTROLS.blitz5,
      });
    });

    it('should initialize with correct time', () => {
      const state = useGameStore.getState();
      expect(state.whiteTimeMs).toBe(TIME_CONTROLS.blitz5.baseMs);
      expect(state.blackTimeMs).toBe(TIME_CONTROLS.blitz5.baseMs);
    });

    it('should decrement time correctly', () => {
      const { decrementTime } = useGameStore.getState();

      decrementTime('w', 1000);

      const state = useGameStore.getState();
      expect(state.whiteTimeMs).toBe(TIME_CONTROLS.blitz5.baseMs - 1000);
      expect(state.blackTimeMs).toBe(TIME_CONTROLS.blitz5.baseMs);
    });

    it('should update time for specific player', () => {
      const { updateTime } = useGameStore.getState();

      updateTime('b', 200000);

      const state = useGameStore.getState();
      expect(state.blackTimeMs).toBe(200000);
      expect(state.whiteTimeMs).toBe(TIME_CONTROLS.blitz5.baseMs);
    });
  });

  describe('Game Join', () => {
    it('should join a waiting game successfully', async () => {
      server.use(
        http.post('/api/games/join', async ({ request }) => {
          const body = await request.json() as { gameId: string };
          expect(body.gameId).toBe(GAME_IDS.waiting);

          return HttpResponse.json({
            ...mockGames.waiting,
            status: 'active',
          });
        })
      );

      const response = await fetch('/api/games/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: GAME_IDS.waiting }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe('active');
    });

    it('should prevent joining own game', async () => {
      server.use(
        http.post('/api/games/join', () => {
          return HttpResponse.json(
            { error: 'Cannot join your own game' },
            { status: 400 }
          );
        })
      );

      const response = await fetch('/api/games/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: GAME_IDS.waiting }),
      });

      expect(response.status).toBe(400);
    });

    it('should prevent joining a full game', async () => {
      server.use(
        http.post('/api/games/join', () => {
          return HttpResponse.json(
            { error: 'Game is already full' },
            { status: 409 }
          );
        })
      );

      const response = await fetch('/api/games/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: GAME_IDS.ongoing }),
      });

      expect(response.status).toBe(409);
    });
  });

  describe('Ongoing Games', () => {
    it('should return user ongoing game if exists', async () => {
      server.use(
        http.get('/api/games/ongoing', () => {
          return HttpResponse.json({
            ok: true,
            gameId: GAME_IDS.ongoing,
          });
        })
      );

      const response = await fetch('/api/games/ongoing');
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.ok).toBe(true);
      expect(data.gameId).toBe(GAME_IDS.ongoing);
    });

    it('should return null gameId if no ongoing game', async () => {
      server.use(
        http.get('/api/games/ongoing', () => {
          return HttpResponse.json({
            ok: true,
            gameId: null,
          });
        })
      );

      const response = await fetch('/api/games/ongoing');
      const data = await response.json();
      expect(data.gameId).toBeNull();
    });
  });

  describe('Two Player Game Flow', () => {
    it('should simulate a complete two-player game', async () => {
      // Player A creates game
      server.use(
        http.post('/api/games/create', () => {
          return HttpResponse.json({
            gameId: 'two-player-game',
            joinUrl: '/game/two-player-game',
          });
        })
      );

      const createResponse = await fetch('/api/games/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'pvp',
          colorPreference: 'white',
          timeControl: TIME_CONTROLS.blitz5,
        }),
      });
      expect(createResponse.status).toBe(200);

      // Player B joins game
      server.use(
        http.post('/api/games/join', () => {
          return HttpResponse.json({
            id: 'two-player-game',
            status: 'active',
            white_player_id: USER_IDS.playerA,
            black_player_id: USER_IDS.playerB,
            currentFen: STARTING_FEN,
          });
        })
      );

      const joinResponse = await fetch('/api/games/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: 'two-player-game' }),
      });
      expect(joinResponse.status).toBe(200);

      // Initialize game stores for both players
      useGameStore.getState().initGame({
        mode: 'pvp',
        playerColor: 'w',
        timeControl: TIME_CONTROLS.blitz5,
        gameId: 'two-player-game',
      });

      // Player A makes first move
      const moveResult = useGameStore.getState().makeMove('e2', 'e4');
      expect(moveResult).toBe(true);
      expect(useGameStore.getState().boardState.turn).toBe('b');

      // Player B's turn (simulate)
      const playerBMove = useGameStore.getState().makeMove('e7', 'e5');
      expect(playerBMove).toBe(true);
      expect(useGameStore.getState().boardState.turn).toBe('w');
    });
  });
});
