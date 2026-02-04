import { Metadata } from 'next';
import { HomePageClient } from '@/components/home/HomePageClient';
import { BASE_URL, SITE_CONFIG } from '@/lib/config';
import { getLocaleAlternates, getLocaleUrl } from '@/i18n/metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'RoyalGambit - Learn and Play Chess Online',
    description:
      'Learn chess online with free interactive lessons, practice puzzles, and play against AI or friends. From beginner basics to advanced strategy - start your chess journey today.',
    keywords: [
      'chess',
      'online chess',
      'play chess',
      'learn chess',
      'chess lessons',
      'chess puzzles',
      'chess for beginners',
      'stockfish',
      'chess game',
    ],
    alternates: getLocaleAlternates(locale),
    openGraph: {
      title: 'RoyalGambit - Learn and Play Chess Online',
      description:
        'Learn chess online with free interactive lessons, practice puzzles, and play against AI or friends. From beginner basics to advanced strategy.',
      url: getLocaleUrl(locale),
      siteName: SITE_CONFIG.name,
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : locale === 'hi' ? 'hi_IN' : locale === 'sa' ? 'sa_IN' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'RoyalGambit - Learn and Play Chess Online',
      description:
        'Learn chess online with free interactive lessons, practice puzzles, and play against AI or friends.',
    },
  };
}

// FAQ data for structured data
const homeFaqs = [
  {
    question: 'Is Royal Gambit Chess free to use?',
    answer:
      'Yes, the learning content and play features are available to get started without payment. All our chess guides are freely accessible, and you can play against our AI without an account.',
  },
  {
    question: 'Do I need an account to read the guides?',
    answer:
      'No. All guide pages are public and accessible without signing in. An account is only needed to track your learning progress, maintain streaks, and play rated games against other players.',
  },
  {
    question: 'What level is this for?',
    answer:
      'Royal Gambit serves players from complete beginner to advanced. Our structured learning tracks start with the very basics and progress through opening principles, endgame technique, and strategic thinking.',
  },
];

export default function HomePage() {
  return (
    <>
      <HomePageClient />

      {/* FAQ Structured Data - Server rendered for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: homeFaqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          }),
        }}
      />

      {/* Organization Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: SITE_CONFIG.name,
            url: BASE_URL,
            description: SITE_CONFIG.description,
            sameAs: [],
          }),
        }}
      />
    </>
  );
}
