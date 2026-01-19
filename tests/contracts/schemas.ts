import { z } from 'zod';

// ============================================
// Common Schemas
// ============================================

export const TimeControlSchema = z.object({
  baseMs: z.number().positive(),
  incrementMs: z.number().nonnegative(),
});

export const RatingModeSchema = z.enum(['bullet', 'blitz', 'rapid', 'classical']);

export const GameModeSchema = z.enum(['bot', 'pvp']);

export const GameStatusSchema = z.enum(['waiting', 'active', 'finished', 'aborted']);

export const GameResultSchema = z.enum(['1-0', '0-1', '1/2-1/2', '*']);

export const ColorPreferenceSchema = z.enum(['white', 'black', 'random']);

// ============================================
// Games API Schemas
// ============================================

export const CreateGameRequestSchema = z.object({
  mode: GameModeSchema,
  colorPreference: ColorPreferenceSchema,
  timeControl: TimeControlSchema,
});

export const CreateGameResponseSchema = z.object({
  gameId: z.string(),
  joinUrl: z.string(),
});

export const GamePlayerSchema = z.object({
  id: z.string(),
  username: z.string(),
  displayName: z.string().optional(),
  avatarUrl: z.string().optional(),
  rating: z.number().optional(),
  ratingDelta: z.number().optional(),
  timeRemainingMs: z.number(),
});

export const MoveSchema = z.object({
  id: z.string().optional(),
  gameId: z.string(),
  ply: z.number(),
  uci: z.string(),
  san: z.string(),
  fenAfter: z.string(),
  createdAt: z.string().optional(),
});

export const GameSchema = z.object({
  id: z.string(),
  mode: GameModeSchema,
  gameMode: RatingModeSchema,
  status: GameStatusSchema,
  whitePlayer: GamePlayerSchema.optional(),
  blackPlayer: GamePlayerSchema.optional(),
  createdBy: z.string(),
  createdAt: z.string(),
  startedAt: z.string().optional(),
  endedAt: z.string().optional(),
  initialFen: z.string(),
  currentFen: z.string(),
  pgn: z.string(),
  result: GameResultSchema,
  termination: z.string().optional(),
  timeControl: TimeControlSchema,
  moves: z.array(MoveSchema),
  ratingsProcessed: z.boolean().optional(),
});

export const GetGameResponseSchema = z.object({
  game: GameSchema,
});

export const JoinGameRequestSchema = z.object({
  gameId: z.string(),
});

export const MoveRequestSchema = z.object({
  gameId: z.string(),
  move: z.object({
    from: z.string(),
    to: z.string(),
    promotion: z.string().optional(),
  }),
});

export const MoveResponseSchema = z.object({
  success: z.boolean(),
  gameId: z.string(),
  move: z.object({
    from: z.string(),
    to: z.string(),
  }),
});

export const OngoingGamesResponseSchema = z.object({
  games: z.array(z.object({
    id: z.string(),
    mode: GameModeSchema,
    status: GameStatusSchema,
    whitePlayer: GamePlayerSchema.optional(),
    blackPlayer: GamePlayerSchema.optional(),
    createdAt: z.string(),
  })),
});

export const ResignResponseSchema = z.object({
  success: z.boolean(),
  gameId: z.string(),
  result: GameResultSchema,
});

// ============================================
// Leaderboard API Schemas
// ============================================

export const LeaderboardEntrySchema = z.object({
  userId: z.string(),
  mode: RatingModeSchema,
  elo: z.number(),
  gamesPlayed: z.number(),
  wins: z.number(),
  losses: z.number(),
  draws: z.number(),
  username: z.string(),
  displayName: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
  rank: z.number(),
});

export const LeaderboardResponseSchema = z.object({
  leaderboard: z.array(LeaderboardEntrySchema),
});

// ============================================
// Learn API Schemas
// ============================================

export const TrackLevelSchema = z.enum(['beginner', 'intermediate', 'advanced', 'expert']);

export const TrackSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  level: TrackLevelSchema,
  description: z.string(),
  coverImageUrl: z.string().optional().nullable(),
  orderIndex: z.number(),
  estimatedHours: z.number(),
  isPublished: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  totalLessons: z.number().optional(),
  completedLessons: z.number().optional(),
  inProgressLessons: z.number().optional(),
  completionPercentage: z.number().optional(),
});

export const TracksResponseSchema = z.object({
  tracks: z.array(TrackSchema),
});

export const LessonSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  orderIndex: z.number(),
  estimatedMinutes: z.number(),
});

export const TrackDetailResponseSchema = z.object({
  track: TrackSchema,
  lessons: z.array(LessonSchema),
});

export const LessonStepSchema = z.object({
  id: z.string(),
  type: z.enum(['explain', 'move_task', 'puzzle', 'quiz', 'model_line']),
  orderIndex: z.number(),
  title: z.string(),
  contentMarkdown: z.string().optional(),
  instructionMarkdown: z.string().optional(),
  initialFen: z.string().optional(),
  requiredMoveUci: z.string().optional(),
});

export const LessonDetailResponseSchema = z.object({
  lesson: LessonSchema,
  steps: z.array(LessonStepSchema),
});

export const PracticePackSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  puzzleCount: z.number(),
  difficulty: z.string(),
});

export const PracticePacksResponseSchema = z.object({
  packs: z.array(PracticePackSchema),
});

export const PuzzleSchema = z.object({
  id: z.string(),
  fen: z.string(),
  solutionUci: z.array(z.string()),
  rating: z.number(),
});

export const PracticePackDetailResponseSchema = z.object({
  pack: PracticePackSchema,
  puzzles: z.array(PuzzleSchema),
});

export const ProgressResponseSchema = z.object({
  progress: z.object({
    lessonsCompleted: z.number(),
    lessonsInProgress: z.number(),
    puzzlesSolved: z.number(),
    currentStreak: z.number(),
    longestStreak: z.number(),
  }),
});

export const SaveLessonProgressRequestSchema = z.object({
  lessonId: z.string(),
  status: z.enum(['in_progress', 'completed']),
});

export const SavePuzzleResultRequestSchema = z.object({
  puzzleId: z.string(),
  solved: z.boolean(),
  timeMs: z.number(),
});

// ============================================
// Error Response Schema
// ============================================

export const ErrorResponseSchema = z.object({
  error: z.string(),
});

// ============================================
// Invitations API Schemas
// ============================================

export const InvitationSchema = z.object({
  id: z.string(),
  sender_id: z.string(),
  recipient_id: z.string(),
  status: z.enum(['pending', 'accepted', 'declined', 'expired', 'cancelled']),
  time_control: TimeControlSchema,
  created_at: z.string(),
});

export const SentInvitationsResponseSchema = z.object({
  invitations: z.array(InvitationSchema),
});

export const CancelInvitationResponseSchema = z.object({
  success: z.boolean(),
  invitationId: z.string(),
});

// ============================================
// Matchmaking API Schemas
// ============================================

export const EnqueueRequestSchema = z.object({
  timeControl: TimeControlSchema,
});

export const EnqueueResponseSchema = z.object({
  success: z.boolean(),
  queueId: z.string(),
  timeControl: TimeControlSchema,
});

export const DequeueResponseSchema = z.object({
  success: z.boolean(),
});

// ============================================
// Ratings API Schemas
// ============================================

export const UserRatingsResponseSchema = z.object({
  ratings: z.array(z.object({
    mode: RatingModeSchema,
    elo: z.number(),
    gamesPlayed: z.number(),
  })),
  userId: z.string(),
});
