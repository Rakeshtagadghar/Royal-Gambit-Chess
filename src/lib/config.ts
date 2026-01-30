/**
 * Global site configuration constants
 */

export const SITE_CONFIG = {
  name: 'RoyalGambit',
  description: 'Learn chess online with free interactive lessons, practice puzzles, and play against AI or friends.',
  url: 'https://royal-gambit-chess.vercel.app',
} as const;

/**
 * Base URL for the site - used for canonical URLs, sitemap, and structured data
 */
export const BASE_URL = SITE_CONFIG.url;
