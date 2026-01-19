// Learn module fixtures
import { USER_IDS } from './users';

// Track levels
export type TrackLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Step types
export type LessonStepType = 'explain' | 'move_task' | 'puzzle' | 'quiz' | 'model_line';

// Track interface
export interface LearnTrack {
  id: string;
  slug: string;
  title: string;
  level: TrackLevel;
  description: string;
  coverImageUrl?: string;
  orderIndex: number;
  estimatedHours: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// Lesson interface
export interface LearnLesson {
  id: string;
  trackId: string;
  slug: string;
  title: string;
  description: string;
  orderIndex: number;
  estimatedMinutes: number;
  isPublished: boolean;
  prerequisiteLessonId?: string;
  createdAt: string;
  updatedAt: string;
}

// Lesson step interface
export interface LearnLessonStep {
  id: string;
  lessonId: string;
  type: LessonStepType;
  orderIndex: number;
  title: string;
  // For 'explain' type
  contentMarkdown?: string;
  // For 'move_task' type
  instructionMarkdown?: string;
  initialFen?: string;
  requiredMoveUci?: string;
  // For 'puzzle' type
  puzzleFen?: string;
  solutionLine?: string[];
  // For 'quiz' type
  questionMarkdown?: string;
  options?: { id: string; text: string; isCorrect: boolean }[];
  // For 'model_line' type
  pgn?: string;
  annotations?: Record<string, string>;
}

// Puzzle interface
export interface LearnPuzzle {
  id: string;
  packId: string;
  fen: string;
  solutionUci: string[];
  rating: number;
  themes: string[];
  orderIndex: number;
}

// Practice pack interface
export interface PracticePack {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: TrackLevel;
  puzzleCount: number;
  isPublished: boolean;
}

// User progress interface
export interface LearnUserProgress {
  id: string;
  userId: string;
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completedSteps: string[];
  lastStepId?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Deterministic IDs
export const TRACK_IDS = {
  beginner: 'track-beginner-1111',
  intermediate: 'track-intermediate-2222',
  advanced: 'track-advanced-3333',
  expert: 'track-expert-4444',
} as const;

export const LESSON_IDS = {
  movingPieces: 'lesson-moving-pieces-1111',
  checkAndCheckmate: 'lesson-check-checkmate-2222',
  basicTactics: 'lesson-basic-tactics-3333',
  openingPrinciples: 'lesson-opening-principles-4444',
} as const;

export const PACK_IDS = {
  tactics101: 'pack-tactics-101-1111',
  mateIn1: 'pack-mate-in-1-2222',
  forks: 'pack-forks-3333',
} as const;

// Mock Tracks
export const mockTracks: Record<string, LearnTrack> = {
  beginner: {
    id: TRACK_IDS.beginner,
    slug: 'beginner-basics',
    title: 'Beginner Basics',
    level: 'beginner',
    description: 'Learn the fundamentals of chess from piece movements to basic checkmates.',
    coverImageUrl: '/images/tracks/beginner.png',
    orderIndex: 1,
    estimatedHours: 3,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  intermediate: {
    id: TRACK_IDS.intermediate,
    slug: 'intermediate-tactics',
    title: 'Intermediate Tactics',
    level: 'intermediate',
    description: 'Master tactical patterns and combinations.',
    coverImageUrl: '/images/tracks/intermediate.png',
    orderIndex: 2,
    estimatedHours: 5,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  advanced: {
    id: TRACK_IDS.advanced,
    slug: 'advanced-strategy',
    title: 'Advanced Strategy',
    level: 'advanced',
    description: 'Deep strategic concepts and positional play.',
    orderIndex: 3,
    estimatedHours: 8,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  expert: {
    id: TRACK_IDS.expert,
    slug: 'expert-endgames',
    title: 'Expert Endgames',
    level: 'expert',
    description: 'Master complex endgame techniques.',
    orderIndex: 4,
    estimatedHours: 10,
    isPublished: false, // Unpublished track for testing
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
};

// Mock Lessons
export const mockLessons: Record<string, LearnLesson> = {
  movingPieces: {
    id: LESSON_IDS.movingPieces,
    trackId: TRACK_IDS.beginner,
    slug: 'moving-pieces',
    title: 'Moving Pieces',
    description: 'Learn how each piece moves on the chessboard.',
    orderIndex: 1,
    estimatedMinutes: 15,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  checkAndCheckmate: {
    id: LESSON_IDS.checkAndCheckmate,
    trackId: TRACK_IDS.beginner,
    slug: 'check-and-checkmate',
    title: 'Check and Checkmate',
    description: 'Understanding check, checkmate, and stalemate.',
    orderIndex: 2,
    estimatedMinutes: 20,
    isPublished: true,
    prerequisiteLessonId: LESSON_IDS.movingPieces,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  basicTactics: {
    id: LESSON_IDS.basicTactics,
    trackId: TRACK_IDS.intermediate,
    slug: 'basic-tactics',
    title: 'Basic Tactics',
    description: 'Learn forks, pins, and skewers.',
    orderIndex: 1,
    estimatedMinutes: 30,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  openingPrinciples: {
    id: LESSON_IDS.openingPrinciples,
    trackId: TRACK_IDS.intermediate,
    slug: 'opening-principles',
    title: 'Opening Principles',
    description: 'Key concepts for the opening phase.',
    orderIndex: 2,
    estimatedMinutes: 25,
    isPublished: true,
    prerequisiteLessonId: LESSON_IDS.basicTactics,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
};

// Mock Lesson Steps
export const mockLessonSteps: LearnLessonStep[] = [
  // Moving Pieces lesson steps
  {
    id: 'step-1-explain',
    lessonId: LESSON_IDS.movingPieces,
    type: 'explain',
    orderIndex: 1,
    title: 'Introduction to Chess Pieces',
    contentMarkdown: '# Chess Pieces\n\nChess has six different types of pieces, each with unique movement patterns.\n\n- **King**: Moves one square in any direction\n- **Queen**: Moves any number of squares in any direction\n- **Rook**: Moves any number of squares horizontally or vertically\n- **Bishop**: Moves any number of squares diagonally\n- **Knight**: Moves in an "L" shape\n- **Pawn**: Moves forward one square (or two on first move)',
  },
  {
    id: 'step-2-move-task',
    lessonId: LESSON_IDS.movingPieces,
    type: 'move_task',
    orderIndex: 2,
    title: 'Move the Pawn',
    instructionMarkdown: 'Move the pawn from e2 to e4.',
    initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    requiredMoveUci: 'e2e4',
  },
  {
    id: 'step-3-quiz',
    lessonId: LESSON_IDS.movingPieces,
    type: 'quiz',
    orderIndex: 3,
    title: 'Test Your Knowledge',
    questionMarkdown: 'Which piece can jump over other pieces?',
    options: [
      { id: 'opt-1', text: 'Queen', isCorrect: false },
      { id: 'opt-2', text: 'Knight', isCorrect: true },
      { id: 'opt-3', text: 'Rook', isCorrect: false },
      { id: 'opt-4', text: 'Bishop', isCorrect: false },
    ],
  },
  {
    id: 'step-4-puzzle',
    lessonId: LESSON_IDS.checkAndCheckmate,
    type: 'puzzle',
    orderIndex: 1,
    title: 'Find the Checkmate',
    puzzleFen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    solutionLine: ['h5f7'],
  },
  {
    id: 'step-5-model-line',
    lessonId: LESSON_IDS.openingPrinciples,
    type: 'model_line',
    orderIndex: 1,
    title: 'Italian Game',
    pgn: '1. e4 e5 2. Nf3 Nc6 3. Bc4',
    annotations: {
      '1': 'Control the center with a pawn.',
      '2': 'Develop the knight toward the center.',
      '3': 'The Italian Game - attacking f7.',
    },
  },
];

// Mock Practice Packs
export const mockPracticePacks: Record<string, PracticePack> = {
  tactics101: {
    id: PACK_IDS.tactics101,
    slug: 'tactics-101',
    title: 'Tactics 101',
    description: 'Basic tactical patterns for beginners.',
    difficulty: 'beginner',
    puzzleCount: 20,
    isPublished: true,
  },
  mateIn1: {
    id: PACK_IDS.mateIn1,
    slug: 'mate-in-1',
    title: 'Mate in 1',
    description: 'Find the checkmate in one move.',
    difficulty: 'beginner',
    puzzleCount: 50,
    isPublished: true,
  },
  forks: {
    id: PACK_IDS.forks,
    slug: 'forks',
    title: 'Fork Training',
    description: 'Master the fork tactic.',
    difficulty: 'intermediate',
    puzzleCount: 30,
    isPublished: true,
  },
};

// Mock Puzzles
export const mockPuzzles: LearnPuzzle[] = [
  {
    id: 'puzzle-1',
    packId: PACK_IDS.mateIn1,
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    solutionUci: ['h5f7'],
    rating: 800,
    themes: ['mate', 'sacrifice'],
    orderIndex: 1,
  },
  {
    id: 'puzzle-2',
    packId: PACK_IDS.mateIn1,
    fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
    solutionUci: ['e1e8'],
    rating: 700,
    themes: ['mate', 'backRankMate'],
    orderIndex: 2,
  },
  {
    id: 'puzzle-3',
    packId: PACK_IDS.forks,
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    solutionUci: ['f3e5', 'c6e5'],
    rating: 1000,
    themes: ['fork', 'knight'],
    orderIndex: 1,
  },
];

// Mock User Progress
export const mockUserProgress: LearnUserProgress[] = [
  {
    id: 'progress-1',
    userId: USER_IDS.playerA,
    lessonId: LESSON_IDS.movingPieces,
    status: 'completed',
    completedSteps: ['step-1-explain', 'step-2-move-task', 'step-3-quiz'],
    lastStepId: 'step-3-quiz',
    completedAt: '2024-01-10T12:00:00Z',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T12:00:00Z',
  },
  {
    id: 'progress-2',
    userId: USER_IDS.playerA,
    lessonId: LESSON_IDS.checkAndCheckmate,
    status: 'in_progress',
    completedSteps: ['step-4-puzzle'],
    lastStepId: 'step-4-puzzle',
    createdAt: '2024-01-11T10:00:00Z',
    updatedAt: '2024-01-11T11:00:00Z',
  },
  {
    id: 'progress-3',
    userId: USER_IDS.playerB,
    lessonId: LESSON_IDS.movingPieces,
    status: 'in_progress',
    completedSteps: ['step-1-explain'],
    lastStepId: 'step-1-explain',
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-12T10:30:00Z',
  },
];

// Factory functions
export function createTrack(overrides: Partial<LearnTrack> = {}): LearnTrack {
  return {
    id: `track-${Date.now()}`,
    slug: `track-${Date.now()}`,
    title: 'New Track',
    level: 'beginner',
    description: 'A new learning track.',
    orderIndex: 99,
    estimatedHours: 1,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createLesson(overrides: Partial<LearnLesson> = {}): LearnLesson {
  return {
    id: `lesson-${Date.now()}`,
    trackId: TRACK_IDS.beginner,
    slug: `lesson-${Date.now()}`,
    title: 'New Lesson',
    description: 'A new lesson.',
    orderIndex: 99,
    estimatedMinutes: 15,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createPuzzle(overrides: Partial<LearnPuzzle> = {}): LearnPuzzle {
  return {
    id: `puzzle-${Date.now()}`,
    packId: PACK_IDS.tactics101,
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    solutionUci: ['e2e4'],
    rating: 1000,
    themes: ['opening'],
    orderIndex: 99,
    ...overrides,
  };
}
