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

  console.log('🟡 Upserting profile:', { id: user.id, username, displayName, avatarUrl });

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

export function useAuth() {
  const { user, profile, isLoading, isInitialized, setUser, setProfile, setIsLoading, setIsInitialized, reset } = useAuthStore();

  useEffect(() => {
    const supabase = getSupabaseClient();
    
    // Get initial session
    const initAuth = async () => {
      try {
        console.log('🔵 Starting initAuth');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('🔴 Session error:', sessionError);
        }

        console.log('🔵 Session result:', { hasSession: !!session, userId: session?.user?.id, userEmail: session?.user?.email });

        if (session?.user) {
          setUser(session.user);

          const profileData = await loadOrCreateProfile(supabase, session.user);

          if (profileData) {
            const mappedProfile = mapDbProfileToProfile(profileData);
            console.log('🔵 Profile loaded and mapped:', mappedProfile);
            setProfile(mappedProfile);
          } else {
            console.log('🔴 No profile data available for user');
            console.log('🔴 Current state - user exists:', !!session?.user);
            setProfile(null);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);

        const profileData = await loadOrCreateProfile(supabase, session.user);
        if (profileData) setProfile(mapDbProfileToProfile(profileData));
      } else if (event === 'SIGNED_OUT') {
        reset();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setProfile, setIsLoading, setIsInitialized, reset]);

  const signIn = async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
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
    console.log('🔵 Starting signOut');
    
    try {
      // Add timeout to prevent hanging
      const signOutPromise = supabase.auth.signOut({ scope: 'local' });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('SignOut timeout')), 3000)
      );
      
      await Promise.race([signOutPromise, timeoutPromise]);
      console.log('🔵 Supabase signOut success');
    } catch (error) {
      console.warn('⚠️ SignOut issue (continuing anyway):', error);
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
    
    console.log('🔵 Cleared cookies and localStorage, redirecting...');
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
  };
}

