/**
 * Centralized API URL constants and helper functions
 * All API endpoints should be defined here for maintainability
 */

const API_BASE = '/api';

// Games API
export const gamesApi = {
  create: () => `${API_BASE}/games/create`,
  get: (gameId: string) => `${API_BASE}/games/get?gameId=${encodeURIComponent(gameId)}`,
  join: () => `${API_BASE}/games/join`,
  move: () => `${API_BASE}/games/move`,
  ongoing: (params?: { since?: string; baseMs?: number; incrementMs?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.since) searchParams.set('since', params.since);
    if (params?.baseMs !== undefined) searchParams.set('baseMs', params.baseMs.toString());
    if (params?.incrementMs !== undefined) searchParams.set('incrementMs', params.incrementMs.toString());
    const query = searchParams.toString();
    return `${API_BASE}/games/ongoing${query ? `?${query}` : ''}`;
  },
  resign: (gameId: string) => `${API_BASE}/games/${gameId}/resign`,
  timeout: (gameId: string) => `${API_BASE}/games/${gameId}/timeout`,
  finish: (gameId: string) => `${API_BASE}/games/${gameId}/finish`,
} as const;

// Matchmaking API
export const matchmakingApi = {
  enqueue: () => `${API_BASE}/matchmaking/enqueue`,
  dequeue: () => `${API_BASE}/matchmaking/dequeue`,
} as const;

// Invitations API
export const invitationsApi = {
  sent: () => `${API_BASE}/invitations/sent`,
  cancel: (invitationId: string) => `${API_BASE}/invitations/${invitationId}/cancel`,
} as const;

// Leaderboard API
export const leaderboardApi = {
  get: (params?: { mode?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.mode) searchParams.set('mode', params.mode);
    if (params?.limit !== undefined) searchParams.set('limit', params.limit.toString());
    const query = searchParams.toString();
    return `${API_BASE}/leaderboard${query ? `?${query}` : ''}`;
  },
} as const;

// Ratings API
export const ratingsApi = {
  getUser: (userId: string) => `${API_BASE}/ratings/${userId}`,
} as const;

// Game Review API
export const gameReviewApi = {
  queue: () => `${API_BASE}/game-review/queue`,
  status: (gameId: string) => `${API_BASE}/game-review/status/${encodeURIComponent(gameId)}`,
  getReview: (gameId: string) => `${API_BASE}/games/${encodeURIComponent(gameId)}/review`,
} as const;

// Learn API
export const learnApi = {
  // Tracks
  tracks: () => `${API_BASE}/learn/tracks`,
  track: (trackSlug: string) => `${API_BASE}/learn/tracks/${encodeURIComponent(trackSlug)}`,

  // Lessons
  lesson: (lessonSlug: string) => `${API_BASE}/learn/lessons/${encodeURIComponent(lessonSlug)}`,

  // Practice
  practicePacks: () => `${API_BASE}/learn/practice`,
  practicePack: (packSlug: string) => `${API_BASE}/learn/practice/${encodeURIComponent(packSlug)}`,

  // Progress
  progress: () => `${API_BASE}/learn/progress`,
  saveProgress: () => `${API_BASE}/learn/progress/lesson`,
  savePuzzleResult: () => `${API_BASE}/learn/progress/puzzle`,

  // Recommendations
  recommended: () => `${API_BASE}/learn/recommended`,
} as const;

// Export all APIs as a single object for convenience
export const apiUrls = {
  games: gamesApi,
  matchmaking: matchmakingApi,
  invitations: invitationsApi,
  leaderboard: leaderboardApi,
  ratings: ratingsApi,
  gameReview: gameReviewApi,
  learn: learnApi,
} as const;

