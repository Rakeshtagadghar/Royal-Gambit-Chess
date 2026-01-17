// Learn/Tutorial System Types

export type LearnLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type LearnTopic = 'rules' | 'tactics' | 'openings' | 'endgames' | 'strategy' | 'calculation';
export type LearnStepType = 'explain' | 'move_task' | 'quiz' | 'puzzle' | 'model_line';
export type LearnProgressStatus = 'not_started' | 'in_progress' | 'completed';
export type PuzzleTopic = 'fork' | 'pin' | 'skewer' | 'mate' | 'endgame' | 'deflection' | 'discovered_attack' | 'zwischenzug' | 'other';

// ============================================
// Track Types
// ============================================
export interface LearnTrack {
  id: string;
  slug: string;
  title: string;
  level: LearnLevel;
  description?: string;
  coverImageUrl?: string;
  orderIndex: number;
  estimatedHours: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LearnTrackWithProgress extends LearnTrack {
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  completionPercentage: number;
}

// ============================================
// Lesson Types
// ============================================
export interface LearnLesson {
  id: string;
  trackId: string;
  slug: string;
  title: string;
  topic: LearnTopic;
  level: LearnLevel;
  description?: string;
  estimatedMinutes: number;
  orderIndex: number;
  prerequisiteLessonIds: string[];
  coverImageUrl?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LearnLessonWithProgress extends LearnLesson {
  progress?: LearnUserProgress;
  isLocked: boolean;
}

// ============================================
// Lesson Step Types
// ============================================
export interface StepArrow {
  from: string;
  to: string;
  color?: string;
}

export interface StepHighlight {
  square: string;
  color?: string;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface StepMeta {
  highlights?: string[];
  arrows?: StepArrow[];
  pieceToMove?: string; // Square of the piece the user must move (e.g., "e4") - will show pulsing highlight
  quiz?: {
    question: string;
    options: QuizOption[];
    correctOptionId: string;
    explainMd?: string;
  };
  boardPrefs?: {
    orientation?: 'white' | 'black';
    allowLegalHighlights?: boolean;
  };
}

export interface LearnLessonStep {
  id: string;
  lessonId: string;
  stepIndex: number;
  type: LearnStepType;
  title?: string;
  bodyMd?: string;
  initialFen?: string;
  requiredMoveUci?: string;
  allowedMovesUci: string[];
  solutionLineUci: string[];
  hints: string[];
  explainCorrectMd?: string;
  explainWrongMd?: string;
  meta: StepMeta;
  createdAt: string;
}

// ============================================
// Practice Pack Types
// ============================================
export interface LearnPracticePack {
  id: string;
  slug: string;
  title: string;
  level: LearnLevel;
  topic: LearnTopic;
  description?: string;
  coverImageUrl?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LearnPracticePackWithPuzzles extends LearnPracticePack {
  puzzles: LearnPuzzle[];
  totalPuzzles: number;
  solvedPuzzles: number;
  accuracy: number;
}

// ============================================
// Puzzle Types
// ============================================
export interface LearnPuzzle {
  id: string;
  level: LearnLevel;
  topic: PuzzleTopic;
  initialFen: string;
  solutionLineUci: string[];
  explanationMd?: string;
  rating: number;
  createdAt: string;
}

export interface LearnPackItem {
  id: string;
  packId: string;
  puzzleId: string;
  orderIndex: number;
}

// ============================================
// User Progress Types
// ============================================
export interface LearnUserProgress {
  id: string;
  userId: string;
  lessonId: string;
  status: LearnProgressStatus;
  lastStepIndex: number;
  attempts: number;
  hintsUsed: number;
  bestScore?: number;
  timeSpentSeconds: number;
  completedAt?: string;
  updatedAt: string;
}

export interface LearnUserPracticeResult {
  id: string;
  userId: string;
  puzzleId: string;
  isCorrect: boolean;
  attempts: number;
  timeMs?: number;
  hintsUsed: number;
  createdAt: string;
}

export interface LearnUserStreak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
  updatedAt: string;
}

// ============================================
// Achievement Types
// ============================================
export interface LearnAchievement {
  id: string;
  slug: string;
  title: string;
  description?: string;
  icon?: string;
  category: string;
  criteria: Record<string, unknown>;
  createdAt: string;
}

export interface LearnUserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  earnedAt: string;
  achievement?: LearnAchievement;
}

// ============================================
// API Response Types
// ============================================
export interface LearnHubData {
  tracks: LearnTrackWithProgress[];
  recommendedLesson?: LearnLessonWithProgress;
  streak?: LearnUserStreak;
  recentAchievements: LearnUserAchievement[];
  stats: {
    totalLessonsCompleted: number;
    totalPuzzlesSolved: number;
    totalTimeSpentMinutes: number;
    currentStreak: number;
  };
}

export interface LearnTrackData {
  track: LearnTrack;
  lessons: LearnLessonWithProgress[];
  progress: {
    totalLessons: number;
    completedLessons: number;
    inProgressLessons: number;
    completionPercentage: number;
  };
}

export interface LearnLessonData {
  lesson: LearnLesson;
  steps: LearnLessonStep[];
  progress?: LearnUserProgress;
  track?: LearnTrack;
  nextLesson?: LearnLesson;
  prevLesson?: LearnLesson;
}

export interface LearnPracticeData {
  pack: LearnPracticePack;
  puzzles: LearnPuzzle[];
  results: LearnUserPracticeResult[];
  stats: {
    totalPuzzles: number;
    solvedPuzzles: number;
    correctPuzzles: number;
    accuracy: number;
  };
}

export interface LearnProgressData {
  tracks: LearnTrackWithProgress[];
  recentLessons: LearnLessonWithProgress[];
  streak: LearnUserStreak;
  achievements: LearnUserAchievement[];
  stats: {
    totalLessonsCompleted: number;
    totalPuzzlesSolved: number;
    totalPuzzlesCorrect: number;
    puzzleAccuracy: number;
    totalTimeSpentMinutes: number;
    currentStreak: number;
    longestStreak: number;
  };
}

// ============================================
// Database Row Types (snake_case for Supabase)
// ============================================
export interface DbLearnTrack {
  id: string;
  slug: string;
  title: string;
  level: LearnLevel;
  description: string | null;
  cover_image_url: string | null;
  order_index: number;
  estimated_hours: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbLearnLesson {
  id: string;
  track_id: string;
  slug: string;
  title: string;
  topic: LearnTopic;
  level: LearnLevel;
  description: string | null;
  estimated_minutes: number;
  order_index: number;
  prerequisite_lesson_ids: string[];
  cover_image_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbLearnLessonStep {
  id: string;
  lesson_id: string;
  step_index: number;
  type: LearnStepType;
  title: string | null;
  body_md: string | null;
  initial_fen: string | null;
  required_move_uci: string | null;
  allowed_moves_uci: string[];
  solution_line_uci: string[];
  hints: string[];
  explain_correct_md: string | null;
  explain_wrong_md: string | null;
  meta: StepMeta;
  created_at: string;
}

export interface DbLearnPracticePack {
  id: string;
  slug: string;
  title: string;
  level: LearnLevel;
  topic: LearnTopic;
  description: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbLearnPuzzle {
  id: string;
  level: LearnLevel;
  topic: PuzzleTopic;
  initial_fen: string;
  solution_line_uci: string[];
  explanation_md: string | null;
  rating: number;
  created_at: string;
}

export interface DbLearnUserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: LearnProgressStatus;
  last_step_index: number;
  attempts: number;
  hints_used: number;
  best_score: number | null;
  time_spent_seconds: number;
  completed_at: string | null;
  updated_at: string;
}

export interface DbLearnUserPracticeResult {
  id: string;
  user_id: string;
  puzzle_id: string;
  is_correct: boolean;
  attempts: number;
  time_ms: number | null;
  hints_used: number;
  created_at: string;
}

export interface DbLearnUserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  updated_at: string;
}

// ============================================
// Utility Functions for Type Conversion
// ============================================
export function dbTrackToTrack(db: DbLearnTrack): LearnTrack {
  return {
    id: db.id,
    slug: db.slug,
    title: db.title,
    level: db.level,
    description: db.description ?? undefined,
    coverImageUrl: db.cover_image_url ?? undefined,
    orderIndex: db.order_index,
    estimatedHours: db.estimated_hours,
    isPublished: db.is_published,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

export function dbLessonToLesson(db: DbLearnLesson): LearnLesson {
  return {
    id: db.id,
    trackId: db.track_id,
    slug: db.slug,
    title: db.title,
    topic: db.topic,
    level: db.level,
    description: db.description ?? undefined,
    estimatedMinutes: db.estimated_minutes,
    orderIndex: db.order_index,
    prerequisiteLessonIds: db.prerequisite_lesson_ids ?? [],
    coverImageUrl: db.cover_image_url ?? undefined,
    isPublished: db.is_published,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

export function dbStepToStep(db: DbLearnLessonStep): LearnLessonStep {
  return {
    id: db.id,
    lessonId: db.lesson_id,
    stepIndex: db.step_index,
    type: db.type,
    title: db.title ?? undefined,
    bodyMd: db.body_md ?? undefined,
    initialFen: db.initial_fen ?? undefined,
    requiredMoveUci: db.required_move_uci ?? undefined,
    allowedMovesUci: db.allowed_moves_uci ?? [],
    solutionLineUci: db.solution_line_uci ?? [],
    hints: db.hints ?? [],
    explainCorrectMd: db.explain_correct_md ?? undefined,
    explainWrongMd: db.explain_wrong_md ?? undefined,
    meta: db.meta ?? {},
    createdAt: db.created_at,
  };
}

export function dbPuzzleToPuzzle(db: DbLearnPuzzle): LearnPuzzle {
  return {
    id: db.id,
    level: db.level,
    topic: db.topic,
    initialFen: db.initial_fen,
    solutionLineUci: db.solution_line_uci ?? [],
    explanationMd: db.explanation_md ?? undefined,
    rating: db.rating,
    createdAt: db.created_at,
  };
}

export function dbProgressToProgress(db: DbLearnUserProgress): LearnUserProgress {
  return {
    id: db.id,
    userId: db.user_id,
    lessonId: db.lesson_id,
    status: db.status,
    lastStepIndex: db.last_step_index,
    attempts: db.attempts,
    hintsUsed: db.hints_used,
    bestScore: db.best_score ?? undefined,
    timeSpentSeconds: db.time_spent_seconds,
    completedAt: db.completed_at ?? undefined,
    updatedAt: db.updated_at,
  };
}

export function dbStreakToStreak(db: DbLearnUserStreak): LearnUserStreak {
  return {
    id: db.id,
    userId: db.user_id,
    currentStreak: db.current_streak,
    longestStreak: db.longest_streak,
    lastActivityDate: db.last_activity_date ?? undefined,
    updatedAt: db.updated_at,
  };
}

export function dbPackToPack(db: DbLearnPracticePack): LearnPracticePack {
  return {
    id: db.id,
    slug: db.slug,
    title: db.title,
    level: db.level,
    topic: db.topic,
    description: db.description ?? undefined,
    coverImageUrl: db.cover_image_url ?? undefined,
    isPublished: db.is_published,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

// ============================================
// Level Display Helpers
// ============================================
export const LEVEL_LABELS: Record<LearnLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};

export const LEVEL_COLORS: Record<LearnLevel, string> = {
  beginner: 'bg-green-500/10 text-green-500 border-green-500/20',
  intermediate: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  advanced: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  expert: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export const TOPIC_LABELS: Record<LearnTopic, string> = {
  rules: 'Rules',
  tactics: 'Tactics',
  openings: 'Openings',
  endgames: 'Endgames',
  strategy: 'Strategy',
  calculation: 'Calculation',
};

export const TOPIC_ICONS: Record<LearnTopic, string> = {
  rules: '📜',
  tactics: '⚔️',
  openings: '🚀',
  endgames: '🏁',
  strategy: '🧠',
  calculation: '🔢',
};
