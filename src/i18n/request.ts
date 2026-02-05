import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { SupportedLocale } from './locales';
import { headers, cookies } from 'next/headers';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Fallback 1: Check headers (injected by middleware)
  if (!locale) {
    const headersList = await headers();
    locale = headersList.get('X-NEXT-INTL-LOCALE') as SupportedLocale;
  }

  // Fallback 2: Check cookies (source of truth)
  if (!locale) {
    const cookieStore = await cookies();
    locale = cookieStore.get('NEXT_LOCALE')?.value as SupportedLocale;
  }

  // Fallback 3: No additional sources available. Will default below.

  if (!locale || !routing.locales.includes(locale as SupportedLocale)) {
    locale = routing.defaultLocale;
  }

  // console.log('[request.ts] Final resolved locale:', locale);

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
