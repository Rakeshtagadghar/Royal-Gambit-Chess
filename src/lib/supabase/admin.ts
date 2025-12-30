import { createClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client that bypasses RLS using the Service Role key.
 *
 * IMPORTANT:
 * - Never import this file from client components.
 * - Requires `SUPABASE_SERVICE_ROLE_KEY` to be set in the server environment.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_URL');
  if (!serviceRoleKey) throw new Error('Missing env: SUPABASE_SERVICE_ROLE_KEY');

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}


