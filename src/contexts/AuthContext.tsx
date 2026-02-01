'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/chess';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    username: string
  ) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setProfile: (profile: Profile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to map DB profile (snake_case) to frontend Profile type (camelCase)
function mapDbProfile(dbProfile: Record<string, unknown>): Profile {
  return {
    id: dbProfile.id as string,
    username: dbProfile.username as string,
    displayName: dbProfile.display_name as string | undefined,
    avatarUrl: dbProfile.avatar_url as string | undefined,
    bio: dbProfile.bio as string | undefined,
    countryCode: dbProfile.country_code as string | undefined,
    isProfilePublic: dbProfile.is_profile_public as boolean | undefined,
    isActivityPublic: dbProfile.is_activity_public as boolean | undefined,
    createdAt: dbProfile.created_at as string,
  };
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const supabase = getSupabaseClient();

  // Fetch profile for a user
  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Profile fetch error:', error);
        return null;
      }
      if (!data) return null;
      return mapDbProfile(data);
    },
    [supabase]
  );

  // Refresh profile (public method)
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const profileData = await fetchProfile(user.id);
    setProfile(profileData);
  }, [user, fetchProfile]);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session - prefer getUser() for security (validates with server)
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (authUser) {
          // Get full session for session object
          const {
            data: { session: currentSession },
          } = await supabase.auth.getSession();

          if (!mounted) return;

          setUser(authUser);
          setSession(currentSession);

          // Fetch profile
          const profileData = await fetchProfile(authUser.id);
          if (mounted) setProfile(profileData);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        if (!mounted) return;

        switch (event) {
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
            if (newSession?.user) {
              setSession(newSession);
              setUser(newSession.user);
              const profileData = await fetchProfile(newSession.user.id);
              if (mounted) setProfile(profileData);
            }
            break;

          case 'SIGNED_OUT':
            setSession(null);
            setUser(null);
            setProfile(null);
            break;

          case 'USER_UPDATED':
            if (newSession?.user) {
              setUser(newSession.user);
            }
            break;
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  // Sign in with email/password
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up with email/password
  const signUp = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    try {
      // Check username availability first
      const { data: existing } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (existing) {
        return { error: new Error('Username is already taken') };
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });

      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with Google OAuth
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    // State will be cleared by onAuthStateChange handler
    // Redirect to home
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isInitialized,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        refreshProfile,
        setProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
