'use client';

import { useEffect } from 'react';
import { AuthChangeEvent, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { Profile } from '@/types/chess';

// Map database snake_case to Profile camelCase
function mapDbProfileToProfile(dbProfile: Record<string, unknown>): Profile {
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

function normalizeUsername(raw: string) {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

async function loadOrCreateProfile(
  supabase: SupabaseClient,
  user: User
): Promise<Record<string, unknown> | null> {
  // Prefer maybeSingle() to avoid "no rows" errors that can mask the real issue.
  const { data: existing, error: existingError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (existingError) {
    console.error('🔴 Profile fetch error:', existingError);
  }

  if (existing) return existing;

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const email = user.email ?? '';
  const emailBase = email.split('@')[0] ?? '';

  const displayName =
    (meta.full_name as string | undefined) ||
    (meta.name as string | undefined) ||
    (meta.username as string | undefined) ||
    emailBase ||
    'User';

  const base =
    (meta.username as string | undefined) ||
    displayName ||
    emailBase ||
    `user_${user.id.slice(0, 8)}`;

  // Add a deterministic suffix to avoid collisions across users.
  const suffix = user.id.slice(0, 8);
  const normalizedBase = normalizeUsername(base) || `user_${suffix}`;
  const username = `${normalizedBase}_${suffix}`;

  const avatarUrl =
    (meta.picture as string | undefined) ||
    (meta.avatar_url as string | undefined) ||
    null;

  const { data: upserted, error: upsertError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        username,
        display_name: displayName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
    .select('*')
    .single();

  if (upsertError) {
    console.error('🔴 Profile upsert error:', upsertError);
    return null;
  }

  return upserted ?? null;
}

// Track if auth has been initialized globally to prevent re-initialization
let authInitStarted = false;

export function useAuth() {
  const { user, profile, isLoading, isInitialized, setUser, setProfile, setIsLoading, setIsInitialized, reset } = useAuthStore();

  useEffect(() => {
    // Only run initialization once across all component instances
    if (authInitStarted) {
      return;
    }
    authInitStarted = true;

    const supabase = getSupabaseClient();
    let didTimeout = false;
    let didCleanup = false;

    // Get initial session
    const initAuth = async () => {
      try {
        // Use getUser() with timeout to prevent infinite loading
        const userPromise = supabase.auth.getUser();
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Auth fetch timeout')), 5000)
        );

        const { data: { user: authUser } } = await Promise.race([
          userPromise,
          timeoutPromise,
        ]).catch(() => {
          return { data: { user: null }, error: null };
        });

        if (didTimeout || didCleanup) return;

        if (authUser) {
          setUser(authUser);

          const profileData = await loadOrCreateProfile(supabase, authUser);

          if (profileData && !didCleanup) {
            const mappedProfile = mapDbProfileToProfile(profileData);
            setProfile(mappedProfile);
          } else if (!didCleanup) {
            setProfile(null);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (!didCleanup) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (!didTimeout && !didCleanup) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    // Fallback timeout - ensure we always initialize even if something hangs
    const fallbackTimeout = setTimeout(() => {
      didTimeout = true;
      setIsLoading(false);
      setIsInitialized(true);
    }, 6000);

    initAuth().finally(() => clearTimeout(fallbackTimeout));

    // Listen for auth changes - this subscription persists for the app lifetime
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (didCleanup) return;
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);

        const profileData = await loadOrCreateProfile(supabase, session.user);
        if (profileData && !didCleanup) setProfile(mapDbProfileToProfile(profileData));
      } else if (event === 'SIGNED_OUT') {
        reset();
        // Allow re-initialization after sign out
        authInitStarted = false;
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Update user on token refresh to keep data fresh
        setUser(session.user);
      }
      // Ignore INITIAL_SESSION event - we handle initial state ourselves
    });

    return () => {
      didCleanup = true;
      subscription.unsubscribe();
    };
    // Empty dependency array - this effect should only run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.user) {
        setUser(data.user);
        const profileData = await loadOrCreateProfile(supabase, data.user);
        if (profileData) {
          setProfile(mapDbProfileToProfile(profileData));
        } else {
          setProfile(null);
        }
      }
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    const supabase = getSupabaseClient();
    setIsLoading(true);

    try {
      // Check if username is taken
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        throw new Error('Username is already taken');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });

      if (error) throw error;

      // Create profile
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          username,
          display_name: username,
          created_at: new Date().toISOString(),
        });
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    const supabase = getSupabaseClient();

    try {
      // Add timeout to prevent hanging
      const signOutPromise = supabase.auth.signOut({ scope: 'local' });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('SignOut timeout')), 3000)
      );

      await Promise.race([signOutPromise, timeoutPromise]);
    } catch {
      // Continue with local cleanup even if signOut fails
    }

    // Always clear local state
    reset();

    // Clear localStorage
    const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0];
    if (projectId) {
      localStorage.removeItem(`sb-${projectId}-auth-token`);
    }

    // Clear all Supabase cookies
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const cookieName = cookie.split('=')[0].trim();
      if (cookieName.startsWith('sb-') || cookieName.includes('supabase')) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
      }
    }

    window.location.href = '/';
  };

  const signInWithGoogle = async () => {
    const supabase = getSupabaseClient();

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Google sign in error:', error);
    }
  };

  return {
    user,
    profile,
    isLoading,
    isInitialized,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    setProfile,
  };
}
