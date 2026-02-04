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

// Locale prefix pattern to strip before checking protected routes
const LOCALE_PREFIX_PATTERN = /^\/(en|fr|hi|sa)/;

function stripLocalePrefix(pathname: string): string {
  return pathname.replace(LOCALE_PREFIX_PATTERN, '');
}

function getLocaleFromPath(pathname: string): string | null {
  const match = pathname.match(LOCALE_PREFIX_PATTERN);
  return match ? match[1] : null;
}

export async function updateSession(request: NextRequest, response?: NextResponse) {
  console.log('[Supabase Middleware] Entering updateSession', {
    hasResponse: !!response,
    intlLocaleHeader: response?.headers.get('x-next-intl-locale')
  });
  if (response) {
    console.log('updateSession incoming headers:',
      response.headers.get('x-next-intl-locale'),
      response.headers.get('x-middleware-rewrite')
    );
  }
  let supabaseResponse = response || NextResponse.next({ request });

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

          // Prepare request headers with locale to ensure next-intl receives it
          const requestHeaders = new Headers(request.headers);
          const localeFromPath = getLocaleFromPath(request.nextUrl.pathname);
          const intlLocaleHeader = response?.headers.get('x-next-intl-locale');

          console.log('[Middleware Debug]', {
            pathname: request.nextUrl.pathname,
            localeFromPath,
            intlLocaleHeader,
            rewriteDest: response?.headers.get('x-middleware-rewrite'),
            cookieName: 'NEXT_LOCALE',
            cookieValue: request.cookies.get('NEXT_LOCALE')
          });

          // Prefer header from intl response, fallback to path
          const locale = intlLocaleHeader || localeFromPath;

          if (locale) {
            requestHeaders.set('x-next-intl-locale', locale);
            // Also set X-NEXT-INTL-LOCALE (uppercase) just in case
            requestHeaders.set('X-NEXT-INTL-LOCALE', locale);
          }

          // Create fresh response with updated cookies and headers
          supabaseResponse = response
            ? NextResponse.rewrite(response.headers.get('x-middleware-rewrite') || request.nextUrl, {
              request: { headers: requestHeaders }
            })
            : NextResponse.next({
              request: { headers: requestHeaders }
            });

          // Copy headers from original response
          if (response) {
            response.headers.forEach((value, key) => {
              supabaseResponse.headers.set(key, value);
            });
          }

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
  // Strip locale prefix for route matching
  const pathnameWithoutLocale = stripLocalePrefix(pathname);
  const locale = getLocaleFromPath(pathname) || 'en';

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathnameWithoutLocale.startsWith(route));

  // Redirect unauthenticated users from protected routes
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth routes (except callbacks)
  if (
    user &&
    isAuthRoute &&
    !pathnameWithoutLocale.startsWith('/auth/callback') &&
    !pathnameWithoutLocale.startsWith('/auth/confirm')
  ) {
    const url = request.nextUrl.clone();
    const redirect = url.searchParams.get('redirect') || `/${locale}/play`;
    url.pathname = redirect;
    url.searchParams.delete('redirect');
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
