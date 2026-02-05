import { MetadataRoute } from 'next';
import { BASE_URL } from '@/lib/config';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/i18n/locales';

// Pages to include in the sitemap with their metadata
const PAGES = [
  { path: '', changeFrequency: 'weekly' as const, priority: 1 },
  { path: '/learn', changeFrequency: 'weekly' as const, priority: 0.9 },
  { path: '/learn/chess-basics', changeFrequency: 'weekly' as const, priority: 0.9 },
  { path: '/learn/opening-principles', changeFrequency: 'weekly' as const, priority: 0.9 },
  { path: '/learn/essential-endgames', changeFrequency: 'weekly' as const, priority: 0.9 },
  { path: '/learn/strategic-thinking', changeFrequency: 'weekly' as const, priority: 0.9 },
  { path: '/chess-guides', changeFrequency: 'weekly' as const, priority: 0.8 },
  { path: '/how-it-works', changeFrequency: 'monthly' as const, priority: 0.7 },
  { path: '/about', changeFrequency: 'monthly' as const, priority: 0.6 },
  { path: '/play', changeFrequency: 'weekly' as const, priority: 0.8 },
  { path: '/leaderboard', changeFrequency: 'daily' as const, priority: 0.7 },
  { path: '/privacy-policy', changeFrequency: 'yearly' as const, priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly' as const, priority: 0.3 },
  { path: '/contact', changeFrequency: 'yearly' as const, priority: 0.4 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString();
  const entries: MetadataRoute.Sitemap = [];

  // Generate entries for each locale
  for (const locale of SUPPORTED_LOCALES) {
    for (const page of PAGES) {
      // Default locale gets slightly higher priority
      const priorityBoost = locale === DEFAULT_LOCALE ? 0 : -0.1;
      const adjustedPriority = Math.max(0.1, page.priority + priorityBoost);

      entries.push({
        url: `${BASE_URL}/${locale}${page.path}`,
        lastModified: currentDate,
        changeFrequency: page.changeFrequency,
        priority: Number(adjustedPriority.toFixed(1)),
      });
    }
  }

  return entries;
}
