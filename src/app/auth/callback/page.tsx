'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = getSupabaseClient();
      
      // Check for error in URL
      const urlError = searchParams.get('error');
      if (urlError) {
        setError(searchParams.get('error_description') || urlError);
        return;
      }

      const { data: callbackData, error: callbackError } =
        await supabase.auth.getSessionFromUrl({ storeSession: true });

      if (callbackError) {
        setError(callbackError.message);
        return;
      }

      if (callbackData?.session) {
        window.history.replaceState({}, document.title, window.location.pathname);
        router.push('/play');
        return;
      }

      // Try to get existing session (might have been set by auth listener)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/play');
        return;
      }

      // No valid auth data found
      setError('No authentication data received');
    };

    handleCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">Authentication error: {error}</p>
          <button 
            onClick={() => router.push('/login')}
            className="text-primary underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
