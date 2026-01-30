import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('🔧 Supabase config:', { 
    url: url ? `${url.substring(0, 30)}...` : 'MISSING',
    keyPresent: !!key,
    keyStart: key ? key.substring(0, 20) : 'MISSING'
  });
  
  if (!url || !key) {
    console.error('🔴 Missing Supabase environment variables!');
  }
  
  return createSupabaseClient(url!, key!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

// Singleton instance for client-side usage
let browserClient: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!browserClient) {
    browserClient = createClient();
  }
  return browserClient;
}

