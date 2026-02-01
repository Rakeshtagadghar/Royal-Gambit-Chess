/**
 * Mock auth store for testing purposes.
 * The actual auth state is now managed by AuthContext.
 * This store provides a compatible interface for tests.
 */
import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/chess';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsInitialized: (isInitialized: boolean) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  profile: null,
  isLoading: true,
  isInitialized: false,
};

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsInitialized: (isInitialized) => set({ isInitialized }),
  reset: () => set(initialState),
}));
