import type { Game, GamePlayer, Move, TimeControl } from '@/types/chess';
import { USER_IDS, mockProfiles } from './users';

// Deterministic game IDs
export const GAME_IDS = {
  ongoing: 'game-ongoing-1111-1111-111111111111',
  finished: 'game-finished-2222-2222-222222222222',
  abandoned: 'game-abandoned-3333-3333-333333333333',
  waiting: 'game-waiting-4444-4444-444444444444',
  botGame: 'game-bot-5555-5555-555555555555',
} as const;

// Common time controls
export const TIME_CONTROLS: Record<string, TimeControl> = {
  bullet1: { baseMs: 60000, incrementMs: 0 },
  bullet2: { baseMs: 120000, incrementMs: 1000 },
  blitz3: { baseMs: 180000, incrementMs: 0 },
  blitz5: { baseMs: 300000, incrementMs: 0 },
  blitz5_3: { baseMs: 300000, incrementMs: 3000 },
  rapid10: { baseMs: 600000, incrementMs: 0 },
  rapid15: { baseMs: 900000, incrementMs: 10000 },
  classical30: { baseMs: 1800000, incrementMs: 0 },
};

// Create a GamePlayer from profile data
function createGamePlayer(
  userId: string,
  timeRemainingMs: number,
  ratingDelta?: number
): GamePlayer {
  const profile = mockProfiles.playerA.id === userId
    ? mockProfiles.playerA
    : mockProfiles.playerB.id === userId
      ? mockProfiles.playerB
      : mockProfiles.spectator;

  return {
    id: userId,
    username: profile.username,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl || undefined,
    rating: profile.ratings?.[1]?.elo || 1200,
    ratingDelta,
    timeRemainingMs,
  };
}

// Starting position FEN
export const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// Mock Games
export const mockGames: Record<string, Game> = {
  ongoing: {
    id: GAME_IDS.ongoing,
    mode: 'pvp',
    gameMode: 'blitz',
    status: 'active',
    whitePlayer: createGamePlayer(USER_IDS.playerA, 280000),
    blackPlayer: createGamePlayer(USER_IDS.playerB, 295000),
    createdBy: USER_IDS.playerA,
    createdAt: '2024-01-15T10:00:00Z',
    startedAt: '2024-01-15T10:00:05Z',
    initialFen: STARTING_FEN,
    currentFen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
    pgn: '1. e4',
    result: '*',
    timeControl: TIME_CONTROLS.blitz5,
    moves: [
      {
        gameId: GAME_IDS.ongoing,
        ply: 1,
        uci: 'e2e4',
        san: 'e4',
        fenAfter: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        createdAt: '2024-01-15T10:00:10Z',
      },
    ],
  },
  finished: {
    id: GAME_IDS.finished,
    mode: 'pvp',
    gameMode: 'blitz',
    status: 'finished',
    whitePlayer: createGamePlayer(USER_IDS.playerA, 120000, 15),
    blackPlayer: createGamePlayer(USER_IDS.playerB, 0, -15),
    createdBy: USER_IDS.playerA,
    createdAt: '2024-01-14T15:00:00Z',
    startedAt: '2024-01-14T15:00:05Z',
    endedAt: '2024-01-14T15:05:00Z',
    initialFen: STARTING_FEN,
    currentFen: 'rnb1kbnr/pppp1ppp/4p3/8/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3',
    pgn: '1. f3 e6 2. g4 Qh4#',
    result: '0-1',
    termination: 'checkmate',
    timeControl: TIME_CONTROLS.blitz5,
    moves: [
      { gameId: GAME_IDS.finished, ply: 1, uci: 'f2f3', san: 'f3', fenAfter: 'rnbqkbnr/pppppppp/8/8/8/5P2/PPPPP1PP/RNBQKBNR b KQkq - 0 1' },
      { gameId: GAME_IDS.finished, ply: 2, uci: 'e7e6', san: 'e6', fenAfter: 'rnbqkbnr/pppp1ppp/4p3/8/8/5P2/PPPPP1PP/RNBQKBNR w KQkq - 0 2' },
      { gameId: GAME_IDS.finished, ply: 3, uci: 'g2g4', san: 'g4', fenAfter: 'rnbqkbnr/pppp1ppp/4p3/8/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq g3 0 2' },
      { gameId: GAME_IDS.finished, ply: 4, uci: 'd8h4', san: 'Qh4#', fenAfter: 'rnb1kbnr/pppp1ppp/4p3/8/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3' },
    ],
    ratingsProcessed: true,
  },
  abandoned: {
    id: GAME_IDS.abandoned,
    mode: 'pvp',
    gameMode: 'rapid',
    status: 'aborted',
    whitePlayer: createGamePlayer(USER_IDS.playerA, 600000),
    blackPlayer: createGamePlayer(USER_IDS.playerB, 600000),
    createdBy: USER_IDS.playerA,
    createdAt: '2024-01-13T12:00:00Z',
    startedAt: '2024-01-13T12:00:05Z',
    endedAt: '2024-01-13T12:00:30Z',
    initialFen: STARTING_FEN,
    currentFen: STARTING_FEN,
    pgn: '',
    result: '*',
    termination: 'aborted',
    timeControl: TIME_CONTROLS.rapid10,
    moves: [],
  },
  waiting: {
    id: GAME_IDS.waiting,
    mode: 'pvp',
    gameMode: 'blitz',
    status: 'waiting',
    whitePlayer: createGamePlayer(USER_IDS.playerA, 300000),
    createdBy: USER_IDS.playerA,
    createdAt: '2024-01-15T11:00:00Z',
    initialFen: STARTING_FEN,
    currentFen: STARTING_FEN,
    pgn: '',
    result: '*',
    timeControl: TIME_CONTROLS.blitz5,
    moves: [],
  },
  botGame: {
    id: GAME_IDS.botGame,
    mode: 'bot',
    gameMode: 'blitz',
    status: 'active',
    whitePlayer: createGamePlayer(USER_IDS.playerA, 290000),
    createdBy: USER_IDS.playerA,
    createdAt: '2024-01-15T09:00:00Z',
    startedAt: '2024-01-15T09:00:00Z',
    initialFen: STARTING_FEN,
    currentFen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
    pgn: '1. e4',
    result: '*',
    timeControl: TIME_CONTROLS.blitz5,
    moves: [
      { gameId: GAME_IDS.botGame, ply: 1, uci: 'e2e4', san: 'e4', fenAfter: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1' },
    ],
  },
};

// Factory function to create custom game
export function createGame(overrides: Partial<Game> = {}): Game {
  const id = overrides.id || `game-${Date.now()}`;
  return {
    id,
    mode: 'pvp',
    gameMode: 'blitz',
    status: 'active',
    whitePlayer: createGamePlayer(USER_IDS.playerA, 300000),
    blackPlayer: createGamePlayer(USER_IDS.playerB, 300000),
    createdBy: USER_IDS.playerA,
    createdAt: new Date().toISOString(),
    initialFen: STARTING_FEN,
    currentFen: STARTING_FEN,
    pgn: '',
    result: '*',
    timeControl: TIME_CONTROLS.blitz5,
    moves: [],
    ...overrides,
  };
}

// Factory function to create a move
export function createMove(
  gameId: string,
  ply: number,
  uci: string,
  san: string,
  fenAfter: string
): Move {
  return {
    id: `move-${gameId}-${ply}`,
    gameId,
    ply,
    uci,
    san,
    fenAfter,
    createdAt: new Date().toISOString(),
  };
}

// Common game scenarios for testing
export const gameScenarios = {
  // Scholar's mate sequence
  scholarsMate: [
    { uci: 'e2e4', san: 'e4', fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1' },
    { uci: 'e7e5', san: 'e5', fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2' },
    { uci: 'f1c4', san: 'Bc4', fen: 'rnbqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 2' },
    { uci: 'b8c6', san: 'Nc6', fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 2 3' },
    { uci: 'd1h5', san: 'Qh5', fen: 'r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 3 3' },
    { uci: 'g8f6', san: 'Nf6', fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4' },
    { uci: 'h5f7', san: 'Qxf7#', fen: 'r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4' },
  ],

  // Fool's mate sequence
  foolsMate: [
    { uci: 'f2f3', san: 'f3', fen: 'rnbqkbnr/pppppppp/8/8/8/5P2/PPPPP1PP/RNBQKBNR b KQkq - 0 1' },
    { uci: 'e7e5', san: 'e5', fen: 'rnbqkbnr/pppp1ppp/8/4p3/8/5P2/PPPPP1PP/RNBQKBNR w KQkq e6 0 2' },
    { uci: 'g2g4', san: 'g4', fen: 'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq g3 0 2' },
    { uci: 'd8h4', san: 'Qh4#', fen: 'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3' },
  ],

  // Draw by stalemate example
  stalemate: {
    fen: 'k7/8/1K6/8/8/8/8/7Q w - - 0 1',
    move: { uci: 'h1a1', san: 'Qa1' },
    resultFen: 'k7/8/1K6/8/8/8/8/Q7 b - - 1 1',
  },
};
