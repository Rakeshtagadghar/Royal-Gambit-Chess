import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type'); // 'signup', 'recovery', 'invite', etc.
  const next = searchParams.get('next') ?? '/play';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Add verified param to show success message
      const redirectUrl = new URL(`${origin}${next}`);
      if (type === 'signup' || type === 'email') {
        redirectUrl.searchParams.set('verified', 'true');
      }
      return NextResponse.redirect(redirectUrl.toString());
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

