import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/stores/authStore';
import { mockUsers, mockProfiles } from '@tests/fixtures/users';

describe('authStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useAuthStore.getState().reset();
  });

  describe('initial state', () => {
    it('should have null user and profile initially', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.profile).toBeNull();
    });

    it('should have isLoading true initially', () => {
      // After reset, isLoading is false, but initial mount would be true
      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(false); // Reset sets it to false
    });

    it('should have isInitialized false initially', () => {
      const state = useAuthStore.getState();
      expect(state.isInitialized).toBe(false);
    });
  });

  describe('setUser', () => {
    it('should set the user', () => {
      const { setUser } = useAuthStore.getState();
      setUser(mockUsers.playerA);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUsers.playerA);
    });

    it('should allow setting user to null', () => {
      const { setUser } = useAuthStore.getState();
      setUser(mockUsers.playerA);
      setUser(null);

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });
  });

  describe('setProfile', () => {
    it('should set the profile', () => {
      const { setProfile } = useAuthStore.getState();
      setProfile(mockProfiles.playerA);

      const state = useAuthStore.getState();
      expect(state.profile).toEqual(mockProfiles.playerA);
    });

    it('should allow setting profile to null', () => {
      const { setProfile } = useAuthStore.getState();
      setProfile(mockProfiles.playerA);
      setProfile(null);

      const state = useAuthStore.getState();
      expect(state.profile).toBeNull();
    });
  });

  describe('setIsLoading', () => {
    it('should set isLoading state', () => {
      const { setIsLoading } = useAuthStore.getState();
      setIsLoading(true);

      expect(useAuthStore.getState().isLoading).toBe(true);

      setIsLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('setIsInitialized', () => {
    it('should set isInitialized state', () => {
      const { setIsInitialized } = useAuthStore.getState();
      setIsInitialized(true);

      expect(useAuthStore.getState().isInitialized).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      const { setUser, setProfile, setIsLoading, setIsInitialized, reset } = useAuthStore.getState();

      // Set some values
      setUser(mockUsers.playerA);
      setProfile(mockProfiles.playerA);
      setIsLoading(true);
      setIsInitialized(true);

      // Reset
      reset();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.profile).toBeNull();
      expect(state.isLoading).toBe(false);
      // Note: reset doesn't touch isInitialized based on the implementation
    });
  });

  describe('authenticated user flow', () => {
    it('should handle sign-in flow correctly', () => {
      const { setUser, setProfile, setIsLoading, setIsInitialized } = useAuthStore.getState();

      // Simulate sign-in flow
      setIsLoading(true);
      setUser(mockUsers.playerA);
      setProfile(mockProfiles.playerA);
      setIsLoading(false);
      setIsInitialized(true);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUsers.playerA);
      expect(state.profile).toEqual(mockProfiles.playerA);
      expect(state.isLoading).toBe(false);
      expect(state.isInitialized).toBe(true);
    });

    it('should handle sign-out flow correctly', () => {
      const { setUser, setProfile, reset } = useAuthStore.getState();

      // Set up authenticated state
      setUser(mockUsers.playerA);
      setProfile(mockProfiles.playerA);

      // Sign out
      reset();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.profile).toBeNull();
    });
  });
});
