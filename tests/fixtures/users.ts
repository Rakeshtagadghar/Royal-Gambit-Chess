import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/chess';

// Deterministic UUIDs for test users
export const USER_IDS = {
  playerA: '11111111-1111-1111-1111-111111111111',
  playerB: '22222222-2222-2222-2222-222222222222',
  spectator: '33333333-3333-3333-3333-333333333333',
  admin: '44444444-4444-4444-4444-444444444444',
} as const;

// Mock Supabase User objects
export const mockUsers: Record<string, User> = {
  playerA: {
    id: USER_IDS.playerA,
    aud: 'authenticated',
    role: 'authenticated',
    email: 'playera@example.com',
    email_confirmed_at: '2024-01-01T00:00:00Z',
    phone: '',
    confirmed_at: '2024-01-01T00:00:00Z',
    last_sign_in_at: '2024-01-15T00:00:00Z',
    app_metadata: { provider: 'email' },
    user_metadata: { username: 'playerA', full_name: 'Player A' },
    identities: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    is_anonymous: false,
  },
  playerB: {
    id: USER_IDS.playerB,
    aud: 'authenticated',
    role: 'authenticated',
    email: 'playerb@example.com',
    email_confirmed_at: '2024-01-01T00:00:00Z',
    phone: '',
    confirmed_at: '2024-01-01T00:00:00Z',
    last_sign_in_at: '2024-01-15T00:00:00Z',
    app_metadata: { provider: 'email' },
    user_metadata: { username: 'playerB', full_name: 'Player B' },
    identities: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    is_anonymous: false,
  },
  spectator: {
    id: USER_IDS.spectator,
    aud: 'authenticated',
    role: 'authenticated',
    email: 'spectator@example.com',
    email_confirmed_at: '2024-01-01T00:00:00Z',
    phone: '',
    confirmed_at: '2024-01-01T00:00:00Z',
    last_sign_in_at: '2024-01-15T00:00:00Z',
    app_metadata: { provider: 'email' },
    user_metadata: { username: 'spectator', full_name: 'Spectator User' },
    identities: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    is_anonymous: false,
  },
};

// Mock Profile objects
export const mockProfiles: Record<string, Profile> = {
  playerA: {
    id: USER_IDS.playerA,
    username: 'playerA',
    displayName: 'Player A',
    avatarUrl: 'https://example.com/avatar-a.png',
    bio: 'Chess enthusiast',
    countryCode: 'US',
    isProfilePublic: true,
    isActivityPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
    stats: {
      gamesPlayed: 100,
      wins: 55,
      losses: 35,
      draws: 10,
    },
    ratings: [
      { userId: USER_IDS.playerA, mode: 'bullet', elo: 1200, gamesPlayed: 20, wins: 12, losses: 6, draws: 2, updatedAt: '2024-01-15T00:00:00Z' },
      { userId: USER_IDS.playerA, mode: 'blitz', elo: 1350, gamesPlayed: 50, wins: 30, losses: 15, draws: 5, updatedAt: '2024-01-15T00:00:00Z' },
      { userId: USER_IDS.playerA, mode: 'rapid', elo: 1450, gamesPlayed: 25, wins: 12, losses: 10, draws: 3, updatedAt: '2024-01-15T00:00:00Z' },
      { userId: USER_IDS.playerA, mode: 'classical', elo: 1500, gamesPlayed: 5, wins: 1, losses: 4, draws: 0, updatedAt: '2024-01-15T00:00:00Z' },
    ],
  },
  playerB: {
    id: USER_IDS.playerB,
    username: 'playerB',
    displayName: 'Player B',
    avatarUrl: 'https://example.com/avatar-b.png',
    bio: 'Learning chess',
    countryCode: 'UK',
    isProfilePublic: true,
    isActivityPublic: true,
    createdAt: '2024-01-05T00:00:00Z',
    stats: {
      gamesPlayed: 50,
      wins: 20,
      losses: 25,
      draws: 5,
    },
    ratings: [
      { userId: USER_IDS.playerB, mode: 'bullet', elo: 1100, gamesPlayed: 10, wins: 4, losses: 5, draws: 1, updatedAt: '2024-01-15T00:00:00Z' },
      { userId: USER_IDS.playerB, mode: 'blitz', elo: 1200, gamesPlayed: 30, wins: 12, losses: 15, draws: 3, updatedAt: '2024-01-15T00:00:00Z' },
      { userId: USER_IDS.playerB, mode: 'rapid', elo: 1250, gamesPlayed: 10, wins: 4, losses: 5, draws: 1, updatedAt: '2024-01-15T00:00:00Z' },
    ],
  },
  spectator: {
    id: USER_IDS.spectator,
    username: 'spectator',
    displayName: 'Spectator User',
    avatarUrl: null,
    bio: 'I just watch',
    countryCode: 'CA',
    isProfilePublic: true,
    isActivityPublic: false,
    createdAt: '2024-01-10T00:00:00Z',
    stats: {
      gamesPlayed: 5,
      wins: 2,
      losses: 2,
      draws: 1,
    },
  },
};

// Factory function to create custom user
export function createUser(overrides: Partial<User> = {}): User {
  return {
    ...mockUsers.playerA,
    id: `user-${Date.now()}`,
    ...overrides,
  };
}

// Factory function to create custom profile
export function createProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    ...mockProfiles.playerA,
    id: `user-${Date.now()}`,
    username: `user_${Date.now()}`,
    ...overrides,
  };
}
