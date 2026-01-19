import type { LeaderboardEntry, RatingMode } from '@/types/chess';
import { USER_IDS, mockProfiles } from './users';

// Mock leaderboard entries
export const mockLeaderboardEntries: LeaderboardEntry[] = [
  {
    userId: USER_IDS.playerA,
    mode: 'blitz',
    elo: 1350,
    gamesPlayed: 50,
    wins: 30,
    losses: 15,
    draws: 5,
    username: mockProfiles.playerA.username,
    displayName: mockProfiles.playerA.displayName,
    avatarUrl: mockProfiles.playerA.avatarUrl || undefined,
    rank: 1,
  },
  {
    userId: USER_IDS.playerB,
    mode: 'blitz',
    elo: 1200,
    gamesPlayed: 30,
    wins: 12,
    losses: 15,
    draws: 3,
    username: mockProfiles.playerB.username,
    displayName: mockProfiles.playerB.displayName,
    avatarUrl: mockProfiles.playerB.avatarUrl || undefined,
    rank: 2,
  },
  {
    userId: USER_IDS.spectator,
    mode: 'blitz',
    elo: 1100,
    gamesPlayed: 5,
    wins: 2,
    losses: 2,
    draws: 1,
    username: mockProfiles.spectator.username,
    displayName: mockProfiles.spectator.displayName,
    avatarUrl: mockProfiles.spectator.avatarUrl || undefined,
    rank: 3,
  },
];

// Generate a full leaderboard for a specific mode
export function generateLeaderboard(
  mode: RatingMode,
  count: number = 100
): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [];

  for (let i = 0; i < count; i++) {
    const baseElo = 2000 - i * 15;
    const gamesPlayed = Math.floor(Math.random() * 200) + 10;
    const winRate = 0.5 + (0.3 * (count - i) / count); // Higher ranked = higher win rate
    const wins = Math.floor(gamesPlayed * winRate);
    const draws = Math.floor(gamesPlayed * 0.1);
    const losses = gamesPlayed - wins - draws;

    entries.push({
      userId: `user-${i + 1}`,
      mode,
      elo: Math.max(100, baseElo),
      gamesPlayed,
      wins,
      losses,
      draws,
      username: `player${i + 1}`,
      displayName: `Player ${i + 1}`,
      rank: i + 1,
    });
  }

  return entries;
}

// ELO calculation constants
export const ELO_CONFIG = {
  kFactor: {
    new: 40,      // New players (< 30 games)
    normal: 20,   // Regular players
    master: 10,   // High rated players (> 2400)
  },
  initialRating: 1200,
  floorRating: 100,
};

/**
 * Calculate expected score (probability of winning)
 */
export function calculateExpectedScore(playerElo: number, opponentElo: number): number {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
}

/**
 * Calculate ELO delta after a game
 */
export function calculateEloDelta(
  playerElo: number,
  opponentElo: number,
  result: 'win' | 'loss' | 'draw',
  gamesPlayed: number
): number {
  const expectedScore = calculateExpectedScore(playerElo, opponentElo);
  const actualScore = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;

  // Determine K factor
  let kFactor = ELO_CONFIG.kFactor.normal;
  if (gamesPlayed < 30) {
    kFactor = ELO_CONFIG.kFactor.new;
  } else if (playerElo > 2400) {
    kFactor = ELO_CONFIG.kFactor.master;
  }

  const delta = Math.round(kFactor * (actualScore - expectedScore));
  return delta;
}

/**
 * Calculate new ELO after a game
 */
export function calculateNewElo(
  playerElo: number,
  opponentElo: number,
  result: 'win' | 'loss' | 'draw',
  gamesPlayed: number
): number {
  const delta = calculateEloDelta(playerElo, opponentElo, result, gamesPlayed);
  return Math.max(ELO_CONFIG.floorRating, playerElo + delta);
}

// Factory function to create leaderboard entry
export function createLeaderboardEntry(overrides: Partial<LeaderboardEntry> = {}): LeaderboardEntry {
  return {
    userId: `user-${Date.now()}`,
    mode: 'blitz',
    elo: 1200,
    gamesPlayed: 10,
    wins: 5,
    losses: 4,
    draws: 1,
    username: `player_${Date.now()}`,
    displayName: 'Test Player',
    rank: 1,
    ...overrides,
  };
}

// Pagination helpers
export function paginateLeaderboard(
  entries: LeaderboardEntry[],
  page: number,
  pageSize: number = 20
): {
  entries: LeaderboardEntry[];
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrev: boolean;
} {
  const totalPages = Math.ceil(entries.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedEntries = entries.slice(startIndex, startIndex + pageSize);

  return {
    entries: paginatedEntries,
    totalPages,
    currentPage: page,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
