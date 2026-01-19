import { http, HttpResponse } from 'msw';

// Base URL for API routes
const API_BASE = '/api';

// Mock data factories
const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  user_metadata: { username: 'testuser' },
  ...overrides,
});

const createMockProfile = (overrides = {}) => ({
  id: 'user-123',
  username: 'testuser',
  display_name: 'Test User',
  avatar_url: null,
  bio: null,
  country_code: null,
  is_profile_public: true,
  is_activity_public: true,
  created_at: new Date().toISOString(),
  ...overrides,
});

const createMockGame = (overrides = {}) => ({
  id: 'game-123',
  mode: 'pvp',
  game_mode: 'blitz',
  status: 'active',
  white_id: 'user-123',
  black_id: 'user-456',
  created_by: 'user-123',
  initial_fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  current_fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  pgn: '',
  result: '*',
  time_control: { baseMs: 300000, incrementMs: 0 },
  created_at: new Date().toISOString(),
  ...overrides,
});

const createMockLeaderboardEntry = (overrides = {}) => ({
  user_id: 'user-123',
  mode: 'blitz',
  elo: 1200,
  games_played: 10,
  wins: 5,
  losses: 3,
  draws: 2,
  username: 'testuser',
  display_name: 'Test User',
  avatar_url: null,
  rank: 1,
  ...overrides,
});

const createMockTrack = (overrides = {}) => ({
  id: 'track-1',
  slug: 'beginner-basics',
  title: 'Beginner Basics',
  level: 'beginner',
  description: 'Learn the fundamentals of chess',
  cover_image_url: null,
  order_index: 1,
  estimated_hours: 2,
  is_published: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

const createMockLesson = (overrides = {}) => ({
  id: 'lesson-1',
  track_id: 'track-1',
  slug: 'moving-pieces',
  title: 'Moving Pieces',
  description: 'Learn how each piece moves',
  order_index: 1,
  estimated_minutes: 15,
  is_published: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// Auth state for testing
let isAuthenticated = true;

export const setMockAuthState = (authenticated: boolean) => {
  isAuthenticated = authenticated;
};

// Helper to check auth
const requireAuth = () => {
  if (!isAuthenticated) {
    return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
};

export const handlers = [
  // Games API
  http.post(`${API_BASE}/games/create`, async ({ request }) => {
    const authError = requireAuth();
    if (authError) return authError;

    const body = await request.json() as { mode: string; colorPreference: string; timeControl: { baseMs: number; incrementMs: number } };
    const game = createMockGame({
      mode: body.mode,
      time_control: body.timeControl,
    });

    return HttpResponse.json({
      gameId: game.id,
      joinUrl: `/game/${game.id}`,
    });
  }),

  http.get(`${API_BASE}/games/get`, ({ request }) => {
    const authError = requireAuth();
    if (authError) return authError;

    const url = new URL(request.url);
    const gameId = url.searchParams.get('gameId');

    if (!gameId) {
      return HttpResponse.json({ error: 'Game ID required' }, { status: 400 });
    }

    const game = createMockGame({ id: gameId });
    return HttpResponse.json({ game });
  }),

  http.post(`${API_BASE}/games/join`, async ({ request }) => {
    const authError = requireAuth();
    if (authError) return authError;

    const body = await request.json() as { gameId: string };
    const game = createMockGame({ id: body.gameId, status: 'active' });

    return HttpResponse.json({ game });
  }),

  http.post(`${API_BASE}/games/move`, async ({ request }) => {
    const authError = requireAuth();
    if (authError) return authError;

    const body = await request.json() as { gameId: string; move: { from: string; to: string } };

    return HttpResponse.json({
      success: true,
      gameId: body.gameId,
      move: body.move,
    });
  }),

  http.get(`${API_BASE}/games/ongoing`, () => {
    return HttpResponse.json({
      games: [
        createMockGame({ id: 'game-1' }),
        createMockGame({ id: 'game-2' }),
      ],
    });
  }),

  http.post(`${API_BASE}/games/:id/resign`, ({ params }) => {
    const authError = requireAuth();
    if (authError) return authError;

    return HttpResponse.json({
      success: true,
      gameId: params.id,
      result: '0-1',
    });
  }),

  http.post(`${API_BASE}/games/:id/timeout`, ({ params }) => {
    const authError = requireAuth();
    if (authError) return authError;

    return HttpResponse.json({
      success: true,
      gameId: params.id,
      result: '1-0',
    });
  }),

  http.post(`${API_BASE}/games/:id/finish`, ({ params }) => {
    const authError = requireAuth();
    if (authError) return authError;

    return HttpResponse.json({
      success: true,
      gameId: params.id,
    });
  }),

  // Matchmaking API
  http.post(`${API_BASE}/matchmaking/enqueue`, async ({ request }) => {
    const authError = requireAuth();
    if (authError) return authError;

    const body = await request.json() as { timeControl: { baseMs: number; incrementMs: number } };

    return HttpResponse.json({
      success: true,
      queueId: 'queue-123',
      timeControl: body.timeControl,
    });
  }),

  http.post(`${API_BASE}/matchmaking/dequeue`, () => {
    const authError = requireAuth();
    if (authError) return authError;

    return HttpResponse.json({ success: true });
  }),

  // Invitations API
  http.get(`${API_BASE}/invitations/sent`, () => {
    const authError = requireAuth();
    if (authError) return authError;

    return HttpResponse.json({
      invitations: [
        {
          id: 'inv-1',
          sender_id: 'user-123',
          recipient_id: 'user-456',
          status: 'pending',
          time_control: { baseMs: 300000, incrementMs: 0 },
          created_at: new Date().toISOString(),
        },
      ],
    });
  }),

  http.post(`${API_BASE}/invitations/:id/cancel`, ({ params }) => {
    const authError = requireAuth();
    if (authError) return authError;

    return HttpResponse.json({
      success: true,
      invitationId: params.id,
    });
  }),

  // Leaderboard API
  http.get(`${API_BASE}/leaderboard`, ({ request }) => {
    const url = new URL(request.url);
    const mode = url.searchParams.get('mode') || 'blitz';
    const limit = parseInt(url.searchParams.get('limit') || '100');

    const validModes = ['bullet', 'blitz', 'rapid', 'classical'];
    if (!validModes.includes(mode)) {
      return HttpResponse.json({ error: 'Invalid mode' }, { status: 400 });
    }

    const leaderboard = Array.from({ length: Math.min(limit, 10) }, (_, i) =>
      createMockLeaderboardEntry({
        user_id: `user-${i + 1}`,
        mode,
        rank: i + 1,
        elo: 1500 - i * 10,
        username: `player${i + 1}`,
      })
    );

    return HttpResponse.json({
      leaderboard: leaderboard.map(entry => ({
        userId: entry.user_id,
        mode: entry.mode,
        elo: entry.elo,
        gamesPlayed: entry.games_played,
        wins: entry.wins,
        losses: entry.losses,
        draws: entry.draws,
        username: entry.username,
        displayName: entry.display_name,
        avatarUrl: entry.avatar_url,
        rank: entry.rank,
      })),
    });
  }),

  // Ratings API
  http.get(`${API_BASE}/ratings/:userId`, ({ params }) => {
    return HttpResponse.json({
      ratings: [
        { mode: 'bullet', elo: 1100, gamesPlayed: 5 },
        { mode: 'blitz', elo: 1200, gamesPlayed: 10 },
        { mode: 'rapid', elo: 1300, gamesPlayed: 8 },
        { mode: 'classical', elo: 1400, gamesPlayed: 3 },
      ],
      userId: params.userId,
    });
  }),

  // Learn API - Tracks
  http.get(`${API_BASE}/learn/tracks`, () => {
    const tracks = [
      createMockTrack({ id: 'track-1', slug: 'beginner-basics', level: 'beginner', order_index: 1 }),
      createMockTrack({ id: 'track-2', slug: 'intermediate-tactics', level: 'intermediate', order_index: 2 }),
      createMockTrack({ id: 'track-3', slug: 'advanced-strategy', level: 'advanced', order_index: 3 }),
    ];

    return HttpResponse.json({
      tracks: tracks.map(track => ({
        id: track.id,
        slug: track.slug,
        title: track.title,
        level: track.level,
        description: track.description,
        coverImageUrl: track.cover_image_url,
        orderIndex: track.order_index,
        estimatedHours: track.estimated_hours,
        isPublished: track.is_published,
        createdAt: track.created_at,
        updatedAt: track.updated_at,
        totalLessons: 5,
        completedLessons: isAuthenticated ? 2 : 0,
        inProgressLessons: isAuthenticated ? 1 : 0,
        completionPercentage: isAuthenticated ? 40 : 0,
      })),
    });
  }),

  http.get(`${API_BASE}/learn/tracks/:trackSlug`, ({ params }) => {
    const track = createMockTrack({ slug: params.trackSlug as string });
    const lessons = Array.from({ length: 5 }, (_, i) =>
      createMockLesson({
        id: `lesson-${i + 1}`,
        slug: `lesson-${i + 1}`,
        title: `Lesson ${i + 1}`,
        order_index: i + 1,
      })
    );

    return HttpResponse.json({
      track: {
        id: track.id,
        slug: track.slug,
        title: track.title,
        level: track.level,
        description: track.description,
        coverImageUrl: track.cover_image_url,
        orderIndex: track.order_index,
        estimatedHours: track.estimated_hours,
      },
      lessons: lessons.map(lesson => ({
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        description: lesson.description,
        orderIndex: lesson.order_index,
        estimatedMinutes: lesson.estimated_minutes,
      })),
    });
  }),

  // Learn API - Lessons
  http.get(`${API_BASE}/learn/lessons/:lessonSlug`, ({ params }) => {
    const lesson = createMockLesson({ slug: params.lessonSlug as string });

    return HttpResponse.json({
      lesson: {
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        description: lesson.description,
        orderIndex: lesson.order_index,
        estimatedMinutes: lesson.estimated_minutes,
      },
      steps: [
        {
          id: 'step-1',
          type: 'explain',
          orderIndex: 1,
          title: 'Introduction',
          contentMarkdown: '# Welcome to this lesson\n\nThis is the introduction.',
        },
        {
          id: 'step-2',
          type: 'move_task',
          orderIndex: 2,
          title: 'Your First Move',
          instructionMarkdown: 'Move the pawn to e4',
          initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          requiredMoveUci: 'e2e4',
        },
      ],
    });
  }),

  // Learn API - Practice
  http.get(`${API_BASE}/learn/practice`, () => {
    return HttpResponse.json({
      packs: [
        {
          id: 'pack-1',
          slug: 'tactics-101',
          title: 'Tactics 101',
          description: 'Basic tactical patterns',
          puzzleCount: 20,
          difficulty: 'beginner',
        },
      ],
    });
  }),

  http.get(`${API_BASE}/learn/practice/:packSlug`, ({ params }) => {
    return HttpResponse.json({
      pack: {
        id: 'pack-1',
        slug: params.packSlug,
        title: 'Tactics 101',
        description: 'Basic tactical patterns',
        puzzleCount: 20,
        difficulty: 'beginner',
      },
      puzzles: [
        {
          id: 'puzzle-1',
          fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
          solutionUci: ['f3f7'],
          rating: 800,
        },
      ],
    });
  }),

  // Learn API - Progress
  http.get(`${API_BASE}/learn/progress`, () => {
    const authError = requireAuth();
    if (authError) return authError;

    return HttpResponse.json({
      progress: {
        lessonsCompleted: 5,
        lessonsInProgress: 2,
        puzzlesSolved: 50,
        currentStreak: 3,
        longestStreak: 7,
      },
    });
  }),

  http.post(`${API_BASE}/learn/progress/lesson`, async ({ request }) => {
    const authError = requireAuth();
    if (authError) return authError;

    const body = await request.json() as { lessonId: string; status: string };

    return HttpResponse.json({
      success: true,
      lessonId: body.lessonId,
      status: body.status,
    });
  }),

  http.post(`${API_BASE}/learn/progress/puzzle`, async ({ request }) => {
    const authError = requireAuth();
    if (authError) return authError;

    const body = await request.json() as { puzzleId: string; solved: boolean; timeMs: number };

    return HttpResponse.json({
      success: true,
      puzzleId: body.puzzleId,
      solved: body.solved,
    });
  }),

  // Learn API - Recommended
  http.get(`${API_BASE}/learn/recommended`, () => {
    return HttpResponse.json({
      recommended: [
        createMockLesson({ id: 'lesson-rec-1', title: 'Recommended Lesson 1' }),
        createMockLesson({ id: 'lesson-rec-2', title: 'Recommended Lesson 2' }),
      ],
    });
  }),
];

// Export mock factories for use in tests
export const mockFactories = {
  createMockUser,
  createMockProfile,
  createMockGame,
  createMockLeaderboardEntry,
  createMockTrack,
  createMockLesson,
};
