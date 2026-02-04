import { BASE_URL } from '@/lib/config';
import { SUPPORTED_LOCALES } from './locales';

/**
 * Generate locale-aware alternates for SEO metadata.
 *
 * Each page should self-reference its own locale URL as canonical
 * and include hreflang alternates pointing to all locale variants.
 *
 * @param locale - Current locale (e.g. "en", "fr")
 * @param path - Route path without locale prefix (e.g. "/about", "/learn")
 *               Use "" for the home page.
 */
export function getLocaleAlternates(locale: string, path: string = '') {
  const normalizedPath = path.startsWith('/') ? path : path ? `/${path}` : '';

  const languages: Record<string, string> = {};
  for (const l of SUPPORTED_LOCALES) {
    languages[l] = `${BASE_URL}/${l}${normalizedPath}`;
  }
  languages['x-default'] = `${BASE_URL}/en${normalizedPath}`;

  return {
    canonical: `${BASE_URL}/${locale}${normalizedPath}`,
    languages,
  };
}

/**
 * Generate a locale-prefixed absolute URL.
 */
export function getLocaleUrl(locale: string, path: string = '') {
  const normalizedPath = path.startsWith('/') ? path : path ? `/${path}` : '';
  return `${BASE_URL}/${locale}${normalizedPath}`;
}
