import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ArrowLeft,
  ChevronRight,
  Crown,
  Swords,
  Flag,
  Brain,
  Target,
  Lightbulb,
  GraduationCap,
} from "lucide-react";
import { BASE_URL } from "@/lib/config";
import { getLocaleAlternates, getLocaleUrl } from "@/i18n/metadata";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Chess Guides - Learn Chess Strategy & Tactics | RoyalGambit",
    description:
      "Free chess guides for beginners to advanced players. Learn chess basics, opening principles, essential endgames, and strategic thinking with our comprehensive tutorials.",
    keywords: [
      "chess guides",
      "chess basics",
      "chess openings",
      "chess endgames",
      "chess strategy",
      "learn chess",
      "chess tutorial",
      "chess for beginners",
    ],
    alternates: getLocaleAlternates(locale, "/chess-guides"),
    openGraph: {
      title: "Chess Guides - Learn Chess Strategy & Tactics | RoyalGambit",
      description:
        "Free chess guides for beginners to advanced players. Learn chess basics, opening principles, essential endgames, and strategic thinking.",
      url: getLocaleUrl(locale, "/chess-guides"),
      siteName: "RoyalGambit",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Chess Guides - Learn Chess Strategy & Tactics | RoyalGambit",
      description:
        "Free chess guides for beginners to advanced players. Learn chess basics, opening principles, essential endgames, and strategic thinking.",
    },
  };
}

const mainGuides = [
  {
    titleKey: "mainChessBasicsTitle",
    descriptionKey: "mainChessBasicsDesc",
    level: "Beginner",
    levelColor: "bg-green-500",
    icon: Crown,
    href: "/learn/chess-basics",
    topicKeys: [
      "guideTopics.basics.movement",
      "guideTopics.basics.special",
      "guideTopics.basics.check",
      "guideTopics.basics.patterns",
    ],
  },
  {
    titleKey: "mainOpeningPrinciplesTitle",
    descriptionKey: "mainOpeningPrinciplesDesc",
    level: "Intermediate",
    levelColor: "bg-blue-500",
    icon: Swords,
    href: "/learn/opening-principles",
    topicKeys: [
      "guideTopics.opening.center",
      "guideTopics.opening.development",
      "guideTopics.opening.safety",
      "guideTopics.opening.mistakes",
    ],
  },
  {
    titleKey: "mainEssentialEndgamesTitle",
    descriptionKey: "mainEssentialEndgamesDesc",
    level: "Intermediate",
    levelColor: "bg-blue-500",
    icon: Flag,
    href: "/learn/essential-endgames",
    topicKeys: [
      "guideTopics.endgame.activity",
      "guideTopics.endgame.squares",
      "guideTopics.endgame.mates",
      "guideTopics.endgame.rook",
    ],
  },
  {
    titleKey: "mainStrategicThinkingTitle",
    descriptionKey: "mainStrategicThinkingDesc",
    level: "Advanced",
    levelColor: "bg-purple-500",
    icon: Brain,
    href: "/learn/strategic-thinking",
    topicKeys: [
      "guideTopics.strategy.evaluation",
      "guideTopics.strategy.pawn",
      "guideTopics.strategy.outposts",
      "guideTopics.strategy.prophylaxis",
    ],
  },
];

const quickTopics = [
  {
    titleKey: "topicPieceMovementTitle",
    descriptionKey: "topicPieceMovementDesc",
    href: "/learn/chess-basics",
    icon: Crown,
  },
  {
    titleKey: "topicCheckmatePatternsTitle",
    descriptionKey: "topicCheckmatePatternsDesc",
    href: "/learn/chess-basics",
    icon: Target,
  },
  {
    titleKey: "topicOpeningStrategyTitle",
    descriptionKey: "topicOpeningStrategyDesc",
    href: "/learn/opening-principles",
    icon: Swords,
  },
  {
    titleKey: "topicEndgameTechniqueTitle",
    descriptionKey: "topicEndgameTechniqueDesc",
    href: "/learn/essential-endgames",
    icon: Flag,
  },
  {
    titleKey: "topicPositionEvaluationTitle",
    descriptionKey: "topicPositionEvaluationDesc",
    href: "/learn/strategic-thinking",
    icon: Lightbulb,
  },
  {
    titleKey: "topicLongTermPlanningTitle",
    descriptionKey: "topicLongTermPlanningDesc",
    href: "/learn/strategic-thinking",
    icon: Brain,
  },
];

export default async function ChessGuidesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("chessGuides");
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 max-w-5xl">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('backToHome')}
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-10 w-10 text-primary" />
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
          <p className="text-muted-foreground max-w-3xl">
            {t('heroNoAccount')}
          </p>
        </section>

        {/* Main Guides Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">{t('learningTracksTitle')}</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              {t('learningTracksDesc')}
            </p>

            <div className="space-y-6">
              {mainGuides.map((guide) => (
                <Card key={guide.titleKey} className="overflow-hidden">
                  <div className={`h-1 ${guide.levelColor}`} />
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                          <guide.icon className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${guide.levelColor} text-white`}>
                            {guide.level}
                          </span>
                        </div>
                        <CardTitle className="text-2xl mb-2">{t(guide.titleKey)}</CardTitle>
                        <CardDescription className="text-base mb-4">
                          {t(guide.descriptionKey)}
                        </CardDescription>
                        <div className="mb-4">
                          <h4 className="font-semibold text-sm mb-2">{t('whatYouWillLearn')}</h4>
                          <ul className="grid md:grid-cols-2 gap-1">
                            {guide.topicKeys.map((topicKey, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                {t(topicKey)}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Button asChild>
                          <Link href={guide.href}>
                            {t('readGuide')}
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Topics Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">{t('quickTopicsTitle')}</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              {t('quickTopicsDesc')}
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickTopics.map((topic) => (
                <Link key={topic.titleKey} href={topic.href}>
                  <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-3">
                      <topic.icon className="h-8 w-8 text-primary flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold">{t(topic.titleKey)}</h3>
                        <p className="text-sm text-muted-foreground">{t(topic.descriptionKey)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Learning Path Visual */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold mb-4 text-center">Recommended Learning Path</h2>
            <p className="text-muted-foreground text-center mb-12">
              Follow this order for the best learning experience
            </p>

            <div className="relative">
              {/* Path connector line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2 hidden md:block" />

              <div className="space-y-8">
                {[
                  { num: 1, titleKey: "pathStep1Title", descKey: "pathStep1Desc", color: "bg-green-500" },
                  { num: 2, titleKey: "pathStep2Title", descKey: "pathStep2Desc", color: "bg-blue-500" },
                  { num: 3, titleKey: "pathStep3Title", descKey: "pathStep3Desc", color: "bg-blue-500" },
                  { num: 4, titleKey: "pathStep4Title", descKey: "pathStep4Desc", color: "bg-purple-500" },
                ].map((step, index) => (
                  <div
                    key={step.num}
                    className={`flex items-center gap-4 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                  >
                    <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                      <h3 className="font-semibold text-lg">{t(step.titleKey)}</h3>
                      <p className="text-muted-foreground text-sm">{t(step.descKey)}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-full ${step.color} flex items-center justify-center text-white font-bold z-10`}>
                      {step.num}
                    </div>
                    <div className="flex-1 hidden md:block" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Learning CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <GraduationCap className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl font-bold mb-4">{t('ctaTitle')}</h2>
            <p className="text-muted-foreground mb-8">
              {t('ctaDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/learn">
                  {t('ctaAccess')}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/how-it-works">{t('ctaHowItWorks')}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* BreadcrumbList Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: BASE_URL,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Chess Guides",
                item: `${BASE_URL}/${locale}/chess-guides`,
              },
            ],
          }),
        }}
      />
    </div>
  );
}
