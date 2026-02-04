import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { LOCALE_COOKIE_NAME } from '@/i18n/locales';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const redirectTo = searchParams.get('redirect_to') || '/play';

  // Handle OAuth errors (e.g., user cancelled)
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    const cookieStore = await cookies();
    const locale = cookieStore.get(LOCALE_COOKIE_NAME)?.value || 'en';
    return NextResponse.redirect(
      `${origin}/${locale}/login?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  // Exchange code for session (PKCE flow)
  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Successful authentication - redirect to intended destination
      const cookieStore = await cookies();
      const locale = cookieStore.get(LOCALE_COOKIE_NAME)?.value || 'en';

      // Ensure targetPath starts with /
      const targetPath = redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`;

      return NextResponse.redirect(`${origin}/${locale}${targetPath}`);
    }

    console.error('Code exchange error:', exchangeError);
    const cookieStore = await cookies();
    const locale = cookieStore.get(LOCALE_COOKIE_NAME)?.value || 'en';
    return NextResponse.redirect(
      `${origin}/${locale}/login?error=${encodeURIComponent('Authentication failed. Please try again.')}`
    );
  }

  // No code provided - redirect to login with error
  const cookieStore = await cookies();
  const locale = cookieStore.get(LOCALE_COOKIE_NAME)?.value || 'en';
  return NextResponse.redirect(`${origin}/${locale}/login?error=missing_code`);
}
