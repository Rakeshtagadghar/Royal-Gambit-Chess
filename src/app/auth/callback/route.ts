import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const redirectTo = searchParams.get('redirect_to') || '/play';

  // Handle OAuth errors (e.g., user cancelled)
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  // Exchange code for session (PKCE flow)
  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Successful authentication - redirect to intended destination
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }

    console.error('Code exchange error:', exchangeError);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Authentication failed. Please try again.')}`
    );
  }

  // No code provided - redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=missing_code`);
}
