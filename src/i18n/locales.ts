export const SUPPORTED_LOCALES = ['en', 'fr', 'hi', 'sa'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = 'en';

export const LOCALE_CONFIG = {
  en: {
    label: 'English',
    nativeLabel: 'English',
    direction: 'ltr' as const,
    script: 'Latin',
  },
  fr: {
    label: 'French',
    nativeLabel: 'Francais',
    direction: 'ltr' as const,
    script: 'Latin',
  },
  hi: {
    label: 'Hindi',
    nativeLabel: '\u0939\u093f\u0928\u094d\u0926\u0940',
    direction: 'ltr' as const,
    script: 'Devanagari',
  },
  sa: {
    label: 'Sanskrit',
    nativeLabel: '\u0938\u0902\u0938\u094d\u0915\u0943\u0924\u092e\u094d',
    direction: 'ltr' as const,
    script: 'Devanagari',
  },
} as const;

export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';
export const LOCALE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds
