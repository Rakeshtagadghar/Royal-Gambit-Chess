import createIntlMiddleware from 'next-intl/middleware';
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip i18n for API routes, auth callbacks, and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/auth/callback') ||
    pathname.startsWith('/auth/confirm')
  ) {
    return await updateSession(request);
  }

  // Run next-intl middleware (handles locale detection, redirects, rewrites)
  const intlResponse = intlMiddleware(request);

  console.log('[Root Middleware] intlResponse headers:', {
    'x-next-intl-locale': intlResponse.headers.get('x-next-intl-locale'),
    'x-middleware-rewrite': intlResponse.headers.get('x-middleware-rewrite')
  });

  // If next-intl returns a redirect, return it directly
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  // Run Supabase session management on the rewritten request
  const supabaseResponse = await updateSession(request, intlResponse);

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match the root path explicitly (for locale redirect)
     * and all request paths except static assets, sitemap.xml, and robots.txt
     */
    '/',
    '/((?!_next/static|_next/image|favicon.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:txt|svg|png|jpg|jpeg|gif|webp|ico|wasm|mp3|wav)$).*)',
  ],
};
