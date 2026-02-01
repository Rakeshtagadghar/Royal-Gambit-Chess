import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_ROUTES = [
  '/play',
  '/bot',
  '/lobby',
  '/game',
  '/profile',
  '/settings',
  '/archive',
];
const AUTH_ROUTES = ['/login', '/auth'];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Update request cookies
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Create fresh response with updated cookies
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not add code between createServerClient and getUser()
  // A simple mistake could make it very hard to debug issues with users
  // being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users from protected routes
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth routes (except callbacks)
  if (
    user &&
    isAuthRoute &&
    !pathname.startsWith('/auth/callback') &&
    !pathname.startsWith('/auth/confirm')
  ) {
    const url = request.nextUrl.clone();
    const redirect = url.searchParams.get('redirect') || '/play';
    url.pathname = redirect;
    url.searchParams.delete('redirect');
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
