import { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen,
  Target,
  ChevronRight,
  GraduationCap,
  Crown,
  Swords,
  Flag,
  Brain,
  Puzzle,
  Award,
  Flame,
} from 'lucide-react';
import { BASE_URL } from '@/lib/config';
import { LearnCTA } from '@/components/learn/LearnCTA';
import { getLocaleAlternates, getLocaleUrl } from '@/i18n/metadata';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'Learn Chess - Interactive Lessons & Tutorials | RoyalGambit',
    description:
      'Learn chess with interactive lessons, from beginner basics to advanced strategy. Free chess tutorials covering openings, endgames, tactics, and more. Track your progress.',
    keywords: [
      'learn chess',
      'chess lessons',
      'chess tutorials',
      'chess for beginners',
      'interactive chess',
      'chess course',
      'improve at chess',
    ],
    alternates: getLocaleAlternates(locale, '/learn'),
    openGraph: {
      title: 'Learn Chess - Interactive Lessons & Tutorials | RoyalGambit',
      description:
        'Learn chess with interactive lessons, from beginner basics to advanced strategy. Free chess tutorials covering openings, endgames, tactics, and more.',
      url: getLocaleUrl(locale, '/learn'),
      siteName: 'RoyalGambit',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Learn Chess - Interactive Lessons & Tutorials | RoyalGambit',
      description:
        'Learn chess with interactive lessons, from beginner basics to advanced strategy. Free tutorials and progress tracking.',
    },
  };
}

const learningTracks = [
  {
    titleKey: 'chessBasics',
    levelKey: 'beginner',
    levelColor: 'bg-green-500',
    icon: Crown,
    descriptionKey: 'chessBasicsDesc',
    href: '/learn/chess-basics',
    trackHref: '/learn/track/beginner-basics',
    topicKeys: ['topicPieceMovement', 'topicCastling', 'topicCheck', 'topicBasicMates'],
  },
  {
    titleKey: 'openingPrinciples',
    levelKey: 'intermediate',
    levelColor: 'bg-blue-500',
    icon: Swords,
    descriptionKey: 'openingPrinciplesDesc',
    href: '/learn/opening-principles',
    trackHref: '/learn/track/intermediate-openings',
    topicKeys: ['topicCenterControl', 'topicDevelopment', 'topicKingSafety', 'topicCommonMistakes'],
  },
  {
    titleKey: 'essentialEndgames',
    levelKey: 'intermediate',
    levelColor: 'bg-blue-500',
    icon: Flag,
    descriptionKey: 'essentialEndgamesDesc',
    href: '/learn/essential-endgames',
    trackHref: '/learn/track/intermediate-endgames',
    topicKeys: ['topicKingActivity', 'topicOpposition', 'topicBasicMates', 'topicRookEndgames'],
  },
  {
    titleKey: 'strategicThinking',
    levelKey: 'advanced',
    levelColor: 'bg-purple-500',
    icon: Brain,
    descriptionKey: 'strategicThinkingDesc',
    href: '/learn/strategic-thinking',
    trackHref: '/learn/track/advanced-strategy',
    topicKeys: ['topicImbalances', 'topicPawnStructures', 'topicOutposts', 'topicConverting'],
  },
];

const features = [
  {
    icon: BookOpen,
    titleKey: 'featureInteractiveLessons',
    descriptionKey: 'featureInteractiveLessonsDesc',
  },
  {
    icon: Puzzle,
    titleKey: 'featureTacticalPuzzles',
    descriptionKey: 'featureTacticalPuzzlesDesc',
  },
  {
    icon: Award,
    titleKey: 'featureAchievements',
    descriptionKey: 'featureAchievementsDesc',
  },
  {
    icon: Flame,
    titleKey: 'featureLearningStreaks',
    descriptionKey: 'featureLearningStreaksDesc',
  },
];

const faqKeys = [
  { questionKey: 'faqQ1', answerKey: 'faqA1' },
  { questionKey: 'faqQ2', answerKey: 'faqA2' },
  { questionKey: 'faqQ3', answerKey: 'faqA3' },
  { questionKey: 'faqQ4', answerKey: 'faqA4' },
  { questionKey: 'faqQ5', answerKey: 'faqA5' },
  { questionKey: 'faqQ6', answerKey: 'faqA6' },
];

export default async function LearnPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('learn');
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">{t('title')}</h1>
              <p className="text-muted-foreground text-lg">
                {t('subtitle')}
              </p>
            </div>
          </div>

          <p className="text-lg text-muted-foreground mb-4 max-w-3xl">
            {t('heroIntro')}
          </p>
          <p className="text-muted-foreground max-w-3xl mb-8">
            {t('heroSignIn')}
          </p>

          <LearnCTA variant="hero" />
        </section>

        {/* Learning Tracks Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">{t('learningTracks')}</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              {t('learningTracksDesc')}
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {learningTracks.map((track) => (
                <Card key={track.titleKey} className="overflow-hidden">
                  <div className={`h-1 ${track.levelColor}`} />
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <track.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${track.levelColor} text-white`}>
                            {t(track.levelKey)}
                          </span>
                        </div>
                        <CardTitle className="text-xl">{t(track.titleKey)}</CardTitle>
                        <CardDescription className="mt-1">
                          {t(track.descriptionKey)}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {track.topicKeys.map((topicKey: string) => (
                        <span key={topicKey} className="text-xs bg-muted px-2 py-1 rounded-md">
                          {t(topicKey)}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button asChild size="sm">
                        <Link href={track.href}>{t('readGuide')}</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href={track.trackHref}>
                          {t('interactiveLessons')}
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">{t('whyLearnWithUs')}</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              {t('whyLearnWithUsDesc')}
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <Card key={feature.titleKey} className="text-center">
                  <CardContent className="pt-6">
                    <feature.icon className="h-10 w-10 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold mb-2">{t(feature.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground">{t(feature.descriptionKey)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold mb-4 text-center">{t('faqTitle')}</h2>
            <p className="text-muted-foreground text-center mb-12">
              {t('faqSubtitle')}
            </p>

            <div className="space-y-4">
              {faqKeys.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{t(faq.questionKey)}</h3>
                    <p className="text-muted-foreground">{t(faq.answerKey)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl font-bold mb-4">{t('ctaTitle')}</h2>
            <p className="text-muted-foreground mb-8">
              {t('ctaDesc')}
            </p>
            <LearnCTA variant="bottom" />
          </div>
        </section>
      </main>

      <Footer />

      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqKeys.map((faq) => ({
              '@type': 'Question',
              name: t(faq.questionKey),
              acceptedAnswer: {
                '@type': 'Answer',
                text: t(faq.answerKey),
              },
            })),
          }),
        }}
      />

      {/* Breadcrumb Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: BASE_URL,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Learn',
                item: `${BASE_URL}/${locale}/learn`,
              },
            ],
          }),
        }}
      />
    </div>
  );
}
