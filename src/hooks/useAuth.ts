'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { Profile } from '@/types/chess';

export function useAuth() {
  const router = useRouter();
  const { user, profile, isLoading, isInitialized, setUser, setProfile, setIsLoading, setIsInitialized, reset } = useAuthStore();

  useEffect(() => {
    const supabase = getSupabaseClient();
    
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          
          // Fetch profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileData) {
            setProfile(profileData as Profile);
          }
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
        
        // Fetch or create profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData as Profile);
        }
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
    setIsLoading(true);
    
    try {
      await supabase.auth.signOut();
      reset();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
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

