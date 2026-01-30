import { MetadataRoute } from 'next';
import { BASE_URL } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/learn',
          '/learn/chess-basics',
          '/learn/opening-principles',
          '/learn/essential-endgames',
          '/learn/strategic-thinking',
          '/chess-guides',
          '/about',
          '/how-it-works',
          '/privacy-policy',
          '/terms',
          '/contact',
          '/play',
          '/leaderboard',
        ],
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
          '/settings/',
          '/profile/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
