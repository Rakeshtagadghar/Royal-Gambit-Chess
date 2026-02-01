import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'email' | 'recovery' | 'invite' | 'email_change',
    });

    if (!error) {
      // Email confirmed successfully - redirect to login with success message
      return NextResponse.redirect(`${origin}/login?verified=true`);
    }

    console.error('Email verification error:', error);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Email verification failed. Please try again.')}`
    );
  }

  // Invalid or missing token
  return NextResponse.redirect(`${origin}/login?error=invalid_token`);
}
