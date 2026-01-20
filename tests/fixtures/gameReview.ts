import { GAME_IDS, mockGames } from './games';

// =============================================================================
// TYPES
// =============================================================================

export type AnalysisStatus = 'not_requested' | 'pending' | 'processing' | 'done' | 'failed';
export type MoveClassification = 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
export type EvalType = 'cp' | 'mate';

export interface Evaluation {
  type: EvalType;
  value: number;
}

export interface MoveAnalysis {
  ply: number;
  played_move_uci: string;
  played_move_san: string;
  best_move_uci: string;
  best_move_san: string;
  eval_before: Evaluation;
  eval_after: Evaluation;
  eval_loss_cp: number;
  classification: MoveClassification;
  pv: string[];
}

export interface PlayerAnalysisSummary {
  accuracy: number;
  acpl: number;
  blunders: number;
  mistakes: number;
  inaccuracies: number;
}

export interface GameAnalysis {
  game_id: string;
  status: AnalysisStatus;
  engine_name: string;
  engine_version: string;
  analysis_depth: number;
  time_per_move_ms: number;
  white: PlayerAnalysisSummary;
  black: PlayerAnalysisSummary;
  moves: MoveAnalysis[];
  queued_at: string;
  completed_at: string | null;
}

// =============================================================================
// ANALYSIS IDS
// =============================================================================

export const ANALYSIS_IDS = {
  completed: GAME_IDS.finished,
  pending: 'game-pending-analysis-1111-111111111111',
  processing: 'game-processing-analysis-2222-222222222222',
  failed: 'game-failed-analysis-3333-333333333333',
} as const;

// =============================================================================
// CLASSIFICATION THRESHOLDS (in centipawns)
// =============================================================================

export const CLASSIFICATION_THRESHOLDS = {
  best: 20,
  good: 50,
  inaccuracy: 150,
  mistake: 300,
  // blunder: > 300
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function classifyMove(evalLossCp: number): MoveClassification {
  if (evalLossCp <= CLASSIFICATION_THRESHOLDS.best) return 'best';
  if (evalLossCp <= CLASSIFICATION_THRESHOLDS.good) return 'good';
  if (evalLossCp <= CLASSIFICATION_THRESHOLDS.inaccuracy) return 'inaccuracy';
  if (evalLossCp <= CLASSIFICATION_THRESHOLDS.mistake) return 'mistake';
  return 'blunder';
}

// Lichess-style accuracy formula
export function calculateAccuracy(acpl: number): number {
  if (acpl < 0) return 100;
  const accuracy = 103.1668 * Math.exp(-0.04354 * acpl) - 3.1669;
  return Math.max(0, Math.min(100, accuracy));
}

export function calculateAcpl(moves: MoveAnalysis[], color: 'white' | 'black'): number {
  const playerMoves = moves.filter((_, i) =>
    color === 'white' ? i % 2 === 0 : i % 2 === 1
  );
  if (playerMoves.length === 0) return 0;
  const totalLoss = playerMoves.reduce((sum, m) => sum + m.eval_loss_cp, 0);
  return totalLoss / playerMoves.length;
}

// =============================================================================
// MOCK MOVE ANALYSIS DATA
// =============================================================================

// Fool's mate analysis (4 plies)
export const foolsMateAnalysis: MoveAnalysis[] = [
  {
    ply: 1,
    played_move_uci: 'f2f3',
    played_move_san: 'f3',
    best_move_uci: 'e2e4',
    best_move_san: 'e4',
    eval_before: { type: 'cp', value: 20 },
    eval_after: { type: 'cp', value: -50 },
    eval_loss_cp: 70,
    classification: 'inaccuracy',
    pv: ['e2e4', 'e7e5', 'g1f3'],
  },
  {
    ply: 2,
    played_move_uci: 'e7e5',
    played_move_san: 'e5',
    best_move_uci: 'e7e5',
    best_move_san: 'e5',
    eval_before: { type: 'cp', value: -50 },
    eval_after: { type: 'cp', value: -60 },
    eval_loss_cp: 10,
    classification: 'best',
    pv: ['e7e5', 'd2d4', 'e5d4'],
  },
  {
    ply: 3,
    played_move_uci: 'g2g4',
    played_move_san: 'g4',
    best_move_uci: 'd2d4',
    best_move_san: 'd4',
    eval_before: { type: 'cp', value: -60 },
    eval_after: { type: 'mate', value: -1 },
    eval_loss_cp: 9999, // Mate in 1 available
    classification: 'blunder',
    pv: ['d2d4', 'e5d4', 'g1f3'],
  },
  {
    ply: 4,
    played_move_uci: 'd8h4',
    played_move_san: 'Qh4#',
    best_move_uci: 'd8h4',
    best_move_san: 'Qh4#',
    eval_before: { type: 'mate', value: -1 },
    eval_after: { type: 'mate', value: 0 },
    eval_loss_cp: 0,
    classification: 'best',
    pv: ['d8h4'],
  },
];

// Standard opening analysis (10 plies - Italian Game)
export const italianGameAnalysis: MoveAnalysis[] = [
  {
    ply: 1,
    played_move_uci: 'e2e4',
    played_move_san: 'e4',
    best_move_uci: 'e2e4',
    best_move_san: 'e4',
    eval_before: { type: 'cp', value: 20 },
    eval_after: { type: 'cp', value: 25 },
    eval_loss_cp: 0,
    classification: 'best',
    pv: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1b5'],
  },
  {
    ply: 2,
    played_move_uci: 'e7e5',
    played_move_san: 'e5',
    best_move_uci: 'e7e5',
    best_move_san: 'e5',
    eval_before: { type: 'cp', value: 25 },
    eval_after: { type: 'cp', value: 20 },
    eval_loss_cp: 5,
    classification: 'best',
    pv: ['e7e5', 'g1f3', 'b8c6'],
  },
  {
    ply: 3,
    played_move_uci: 'g1f3',
    played_move_san: 'Nf3',
    best_move_uci: 'g1f3',
    best_move_san: 'Nf3',
    eval_before: { type: 'cp', value: 20 },
    eval_after: { type: 'cp', value: 25 },
    eval_loss_cp: 0,
    classification: 'best',
    pv: ['g1f3', 'b8c6', 'f1b5'],
  },
  {
    ply: 4,
    played_move_uci: 'b8c6',
    played_move_san: 'Nc6',
    best_move_uci: 'b8c6',
    best_move_san: 'Nc6',
    eval_before: { type: 'cp', value: 25 },
    eval_after: { type: 'cp', value: 20 },
    eval_loss_cp: 5,
    classification: 'best',
    pv: ['b8c6', 'f1b5', 'a7a6'],
  },
  {
    ply: 5,
    played_move_uci: 'f1c4',
    played_move_san: 'Bc4',
    best_move_uci: 'f1b5',
    best_move_san: 'Bb5',
    eval_before: { type: 'cp', value: 20 },
    eval_after: { type: 'cp', value: 15 },
    eval_loss_cp: 25,
    classification: 'good',
    pv: ['f1b5', 'a7a6', 'b5a4'],
  },
  {
    ply: 6,
    played_move_uci: 'f8c5',
    played_move_san: 'Bc5',
    best_move_uci: 'g8f6',
    best_move_san: 'Nf6',
    eval_before: { type: 'cp', value: 15 },
    eval_after: { type: 'cp', value: 30 },
    eval_loss_cp: 45,
    classification: 'good',
    pv: ['g8f6', 'd2d3', 'f8e7'],
  },
  {
    ply: 7,
    played_move_uci: 'c2c3',
    played_move_san: 'c3',
    best_move_uci: 'd2d3',
    best_move_san: 'd3',
    eval_before: { type: 'cp', value: 30 },
    eval_after: { type: 'cp', value: 20 },
    eval_loss_cp: 40,
    classification: 'good',
    pv: ['d2d3', 'g8f6', 'b1c3'],
  },
  {
    ply: 8,
    played_move_uci: 'g8f6',
    played_move_san: 'Nf6',
    best_move_uci: 'g8f6',
    best_move_san: 'Nf6',
    eval_before: { type: 'cp', value: 20 },
    eval_after: { type: 'cp', value: 25 },
    eval_loss_cp: 5,
    classification: 'best',
    pv: ['g8f6', 'd2d4', 'e5d4'],
  },
  {
    ply: 9,
    played_move_uci: 'd2d4',
    played_move_san: 'd4',
    best_move_uci: 'd2d4',
    best_move_san: 'd4',
    eval_before: { type: 'cp', value: 25 },
    eval_after: { type: 'cp', value: 30 },
    eval_loss_cp: 0,
    classification: 'best',
    pv: ['d2d4', 'e5d4', 'c3d4'],
  },
  {
    ply: 10,
    played_move_uci: 'e5d4',
    played_move_san: 'exd4',
    best_move_uci: 'e5d4',
    best_move_san: 'exd4',
    eval_before: { type: 'cp', value: 30 },
    eval_after: { type: 'cp', value: 35 },
    eval_loss_cp: 5,
    classification: 'best',
    pv: ['e5d4', 'c3d4', 'c5b4'],
  },
];

// =============================================================================
// MOCK GAME ANALYSIS DATA
// =============================================================================

export const mockGameAnalysis: Record<string, GameAnalysis> = {
  completed: {
    game_id: GAME_IDS.finished,
    status: 'done',
    engine_name: 'stockfish',
    engine_version: '16.1',
    analysis_depth: 12,
    time_per_move_ms: 100,
    white: {
      accuracy: 45.2,
      acpl: 9034, // Very high due to blunder
      blunders: 1,
      mistakes: 0,
      inaccuracies: 1,
    },
    black: {
      accuracy: 99.5,
      acpl: 7.5,
      blunders: 0,
      mistakes: 0,
      inaccuracies: 0,
    },
    moves: foolsMateAnalysis,
    queued_at: '2024-01-14T15:05:00Z',
    completed_at: '2024-01-14T15:05:05Z',
  },
  italianGame: {
    game_id: 'game-italian-6666-6666-666666666666',
    status: 'done',
    engine_name: 'stockfish',
    engine_version: '16.1',
    analysis_depth: 12,
    time_per_move_ms: 100,
    white: {
      accuracy: 92.5,
      acpl: 13,
      blunders: 0,
      mistakes: 0,
      inaccuracies: 0,
    },
    black: {
      accuracy: 89.8,
      acpl: 18,
      blunders: 0,
      mistakes: 0,
      inaccuracies: 0,
    },
    moves: italianGameAnalysis,
    queued_at: '2024-01-15T10:00:00Z',
    completed_at: '2024-01-15T10:00:10Z',
  },
  pending: {
    game_id: ANALYSIS_IDS.pending,
    status: 'pending',
    engine_name: 'stockfish',
    engine_version: '16.1',
    analysis_depth: 12,
    time_per_move_ms: 100,
    white: { accuracy: 0, acpl: 0, blunders: 0, mistakes: 0, inaccuracies: 0 },
    black: { accuracy: 0, acpl: 0, blunders: 0, mistakes: 0, inaccuracies: 0 },
    moves: [],
    queued_at: '2024-01-15T11:00:00Z',
    completed_at: null,
  },
  processing: {
    game_id: ANALYSIS_IDS.processing,
    status: 'processing',
    engine_name: 'stockfish',
    engine_version: '16.1',
    analysis_depth: 12,
    time_per_move_ms: 100,
    white: { accuracy: 0, acpl: 0, blunders: 0, mistakes: 0, inaccuracies: 0 },
    black: { accuracy: 0, acpl: 0, blunders: 0, mistakes: 0, inaccuracies: 0 },
    moves: [],
    queued_at: '2024-01-15T11:00:00Z',
    completed_at: null,
  },
  failed: {
    game_id: ANALYSIS_IDS.failed,
    status: 'failed',
    engine_name: 'stockfish',
    engine_version: '16.1',
    analysis_depth: 12,
    time_per_move_ms: 100,
    white: { accuracy: 0, acpl: 0, blunders: 0, mistakes: 0, inaccuracies: 0 },
    black: { accuracy: 0, acpl: 0, blunders: 0, mistakes: 0, inaccuracies: 0 },
    moves: [],
    queued_at: '2024-01-15T11:00:00Z',
    completed_at: null,
  },
};

// =============================================================================
// API RESPONSE MOCKS
// =============================================================================

export const mockApiResponses = {
  queueSuccess: {
    success: true,
    status: 'pending' as const,
    game_id: GAME_IDS.finished,
    queued_at: '2024-01-15T10:00:00Z',
    message: 'Game queued for analysis',
  },
  queueAlreadyDone: {
    success: true,
    status: 'done' as const,
    game_id: GAME_IDS.finished,
    queued_at: '2024-01-14T15:05:00Z',
    message: 'Analysis already completed',
  },
  reviewDone: {
    status: 'done' as const,
    game_id: GAME_IDS.finished,
    analysis: {
      engine_name: 'stockfish',
      engine_version: '16.1',
      analysis_depth: 12,
      time_per_move_ms: 100,
      completed_at: '2024-01-14T15:05:05Z',
      white: mockGameAnalysis.completed.white,
      black: mockGameAnalysis.completed.black,
    },
    moves: foolsMateAnalysis,
  },
  reviewProcessing: {
    status: 'processing' as const,
    game_id: ANALYSIS_IDS.processing,
    started_at: '2024-01-15T11:00:30Z',
    progress: {
      current_ply: 15,
      total_plies: 60,
      percentage: 25,
    },
  },
  reviewPending: {
    status: 'pending' as const,
    game_id: ANALYSIS_IDS.pending,
    queued_at: '2024-01-15T11:00:00Z',
    queue_position: 3,
  },
  reviewNotRequested: {
    status: 'not_requested' as const,
    game_id: mockGames.ongoing.id,
    message: 'Analysis has not been requested for this game',
  },
  errorGameNotFound: {
    success: false,
    error: 'Game not found',
    code: 'GAME_NOT_FOUND',
  },
  errorUnauthorized: {
    success: false,
    error: 'Authentication required',
    code: 'UNAUTHORIZED',
  },
  errorForbidden: {
    success: false,
    error: "You don't have access to this game",
    code: 'FORBIDDEN',
  },
  errorGameNotFinished: {
    success: false,
    error: 'Analysis can only be performed on finished games',
    code: 'GAME_NOT_FINISHED',
  },
};

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

export function createMoveAnalysis(
  overrides: Partial<MoveAnalysis> = {}
): MoveAnalysis {
  return {
    ply: 1,
    played_move_uci: 'e2e4',
    played_move_san: 'e4',
    best_move_uci: 'e2e4',
    best_move_san: 'e4',
    eval_before: { type: 'cp', value: 20 },
    eval_after: { type: 'cp', value: 25 },
    eval_loss_cp: 0,
    classification: 'best',
    pv: ['e2e4', 'e7e5', 'g1f3'],
    ...overrides,
  };
}

let gameAnalysisCounter = 0;

export function createGameAnalysis(
  overrides: Partial<GameAnalysis> = {}
): GameAnalysis {
  gameAnalysisCounter++;
  return {
    game_id: `game-${Date.now()}-${gameAnalysisCounter}`,
    status: 'done',
    engine_name: 'stockfish',
    engine_version: '16.1',
    analysis_depth: 12,
    time_per_move_ms: 100,
    white: {
      accuracy: 85,
      acpl: 25,
      blunders: 0,
      mistakes: 1,
      inaccuracies: 2,
    },
    black: {
      accuracy: 80,
      acpl: 35,
      blunders: 1,
      mistakes: 1,
      inaccuracies: 3,
    },
    moves: [createMoveAnalysis()],
    queued_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    ...overrides,
  };
}

// =============================================================================
// TEST SCENARIOS
// =============================================================================

export const testScenarios = {
  // Move classification edge cases
  classificationEdgeCases: [
    { evalLoss: 0, expected: 'best' },
    { evalLoss: 20, expected: 'best' },
    { evalLoss: 21, expected: 'good' },
    { evalLoss: 50, expected: 'good' },
    { evalLoss: 51, expected: 'inaccuracy' },
    { evalLoss: 150, expected: 'inaccuracy' },
    { evalLoss: 151, expected: 'mistake' },
    { evalLoss: 300, expected: 'mistake' },
    { evalLoss: 301, expected: 'blunder' },
    { evalLoss: 1000, expected: 'blunder' },
  ],

  // Accuracy calculation cases
  accuracyCases: [
    { acpl: 0, expectedMin: 99, expectedMax: 100 },
    { acpl: 10, expectedMin: 60, expectedMax: 70 },
    { acpl: 25, expectedMin: 30, expectedMax: 40 },
    { acpl: 50, expectedMin: 8, expectedMax: 15 },
    { acpl: 100, expectedMin: 0, expectedMax: 5 },
  ],

  // Games with various error counts
  playerStatsCases: [
    {
      description: 'Perfect game',
      white: { accuracy: 100, acpl: 0, blunders: 0, mistakes: 0, inaccuracies: 0 },
    },
    {
      description: 'Good game',
      white: { accuracy: 90, acpl: 15, blunders: 0, mistakes: 0, inaccuracies: 2 },
    },
    {
      description: 'Average game',
      white: { accuracy: 75, acpl: 35, blunders: 0, mistakes: 2, inaccuracies: 4 },
    },
    {
      description: 'Bad game',
      white: { accuracy: 50, acpl: 80, blunders: 3, mistakes: 5, inaccuracies: 8 },
    },
  ],
};
