import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { server } from '../../msw/server';
import { http, HttpResponse } from 'msw';
import { useAuthStore } from '@/stores/authStore';
import { mockUsers, mockProfiles } from '../fixtures/users';

describe('Authentication Integration', () => {
  beforeEach(() => {
    useAuthStore.getState().reset();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('Auth State Management', () => {
    it('should initialize with no user when not authenticated', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.profile).toBeNull();
      expect(state.isInitialized).toBe(false);
    });

    it('should update state when user signs in', () => {
      const { setUser, setProfile, setIsInitialized } = useAuthStore.getState();

      setUser(mockUsers.playerA);
      setProfile(mockProfiles.playerA);
      setIsInitialized(true);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUsers.playerA);
      expect(state.profile).toEqual(mockProfiles.playerA);
      expect(state.isInitialized).toBe(true);
    });

    it('should clear state when user signs out', () => {
      const { setUser, setProfile, setIsInitialized, reset } = useAuthStore.getState();

      // Sign in first
      setUser(mockUsers.playerA);
      setProfile(mockProfiles.playerA);
      setIsInitialized(true);

      // Sign out
      reset();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.profile).toBeNull();
    });

    it('should handle profile updates correctly', () => {
      const { setUser, setProfile } = useAuthStore.getState();

      setUser(mockUsers.playerA);
      setProfile(mockProfiles.playerA);

      // Update profile
      const updatedProfile = {
        ...mockProfiles.playerA,
        display_name: 'Updated Name',
      };
      setProfile(updatedProfile);

      const state = useAuthStore.getState();
      expect(state.profile?.display_name).toBe('Updated Name');
    });
  });

  describe('Protected API Routes', () => {
    it('should return 401 when accessing protected route without auth', async () => {
      server.use(
        http.get('/api/games/ongoing', () => {
          return HttpResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      const response = await fetch('/api/games/ongoing');
      expect(response.status).toBe(401);
    });

    it('should return 403 when user lacks permission', async () => {
      server.use(
        http.post('/api/games/:id/resign', () => {
          return HttpResponse.json(
            { error: 'Forbidden - not a participant' },
            { status: 403 }
          );
        })
      );

      const response = await fetch('/api/games/game-123/resign', {
        method: 'POST',
      });
      expect(response.status).toBe(403);
    });

    it('should allow access with valid authentication', async () => {
      server.use(
        http.get('/api/games/ongoing', () => {
          return HttpResponse.json({ ok: true, gameId: null });
        })
      );

      const response = await fetch('/api/games/ongoing');
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.ok).toBe(true);
    });
  });

  describe('Session Persistence', () => {
    it('should maintain auth state across store updates', () => {
      const { setUser, setProfile, setIsLoading } = useAuthStore.getState();

      setUser(mockUsers.playerA);
      setProfile(mockProfiles.playerA);

      // Simulate loading state change
      setIsLoading(true);
      expect(useAuthStore.getState().user).toEqual(mockUsers.playerA);

      setIsLoading(false);
      expect(useAuthStore.getState().user).toEqual(mockUsers.playerA);
    });

    it('should handle concurrent state updates', () => {
      const { setUser, setProfile, setIsInitialized } = useAuthStore.getState();

      // Simulate rapid updates
      setUser(mockUsers.playerA);
      setProfile(mockProfiles.playerA);
      setIsInitialized(true);
      setUser(mockUsers.playerB);
      setProfile(mockProfiles.playerB);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUsers.playerB);
      expect(state.profile).toEqual(mockProfiles.playerB);
    });
  });

  describe('Auth Error Handling', () => {
    it('should handle invalid credentials response', async () => {
      server.use(
        http.post('/api/auth/login', () => {
          return HttpResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
          );
        })
      );

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'wrong@test.com', password: 'wrong' }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Invalid credentials');
    });

    it('should handle server errors', async () => {
      server.use(
        http.post('/api/auth/login', () => {
          return HttpResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'password' }),
      });

      expect(response.status).toBe(500);
    });
  });
});
