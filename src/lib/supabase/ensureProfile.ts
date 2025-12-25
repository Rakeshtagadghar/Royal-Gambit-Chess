import type { SupabaseClient, User } from '@supabase/supabase-js';

function normalizeUsername(raw: string) {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Ensures there's a `public.profiles` row for the given auth user.
 * This is important after dev resets where `auth.users` is preserved but `profiles` is dropped/recreated.
 */
export async function ensureProfileExists(supabase: SupabaseClient, user: User) {
  const { data: existing, error: existingError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (!existingError && existing?.id) return;

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

  const suffix = user.id.slice(0, 8);
  const normalizedBase = normalizeUsername(base) || `user_${suffix}`;
  const username = `${normalizedBase}_${suffix}`;

  const avatarUrl =
    (meta.picture as string | undefined) || (meta.avatar_url as string | undefined) || null;

  // Upsert by id; username is unique, so we include a deterministic suffix to avoid collisions.
  await supabase.from('profiles').upsert(
    {
      id: user.id,
      username,
      display_name: displayName,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );
}


