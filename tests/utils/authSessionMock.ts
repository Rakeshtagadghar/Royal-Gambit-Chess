import { vi } from 'vitest';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

// Mock user factory
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-123',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'test@example.com',
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {
      username: 'testuser',
      full_name: 'Test User',
    },
    identities: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_anonymous: false,
    ...overrides,
  };
}

// Mock session factory
export function createMockSession(user?: User): Session {
  const mockUser = user || createMockUser();
  return {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: mockUser,
  };
}

// Auth state change callback type
type AuthStateChangeCallback = (event: AuthChangeEvent, session: Session | null) => void;

// Mock Supabase auth client
export function createMockSupabaseAuth(options: {
  user?: User | null;
  session?: Session | null;
} = {}) {
  const callbacks: AuthStateChangeCallback[] = [];

  const mockAuth = {
    getSession: vi.fn().mockResolvedValue({
      data: { session: options.session ?? null },
      error: null,
    }),
    getUser: vi.fn().mockResolvedValue({
      data: { user: options.user ?? null },
      error: null,
    }),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: {
        user: options.user ?? createMockUser(),
        session: options.session ?? createMockSession(),
      },
      error: null,
    }),
    signUp: vi.fn().mockResolvedValue({
      data: {
        user: options.user ?? createMockUser(),
        session: null,
      },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn((callback: AuthStateChangeCallback) => {
      callbacks.push(callback);
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      };
    }),
    // Helper to trigger auth state changes in tests
    _triggerAuthStateChange: (event: AuthChangeEvent, session: Session | null) => {
      callbacks.forEach(cb => cb(event, session));
    },
  };

  return mockAuth;
}

// Mock the entire Supabase client
export function createMockSupabaseClient(options: {
  user?: User | null;
  session?: Session | null;
} = {}) {
  return {
    auth: createMockSupabaseAuth(options),
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockResolvedValue({ status: 'SUBSCRIBED' }),
      unsubscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
  };
}

// Setup mock for getSupabaseClient
export function setupSupabaseClientMock(options: {
  user?: User | null;
  session?: Session | null;
} = {}) {
  const mockClient = createMockSupabaseClient(options);

  vi.mock('@/lib/supabase/client', () => ({
    getSupabaseClient: vi.fn(() => mockClient),
  }));

  return mockClient;
}
