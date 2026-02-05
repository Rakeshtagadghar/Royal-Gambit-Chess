import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { SITE_CONFIG } from "@/lib/config";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  ArrowLeft,
  ChevronRight,
  GraduationCap,
  Target,
  Bot,
  Users,
  TrendingUp,
  CheckCircle,
  BookOpen,
  Puzzle,
  Award,
  Play,
} from "lucide-react";
import { getLocaleAlternates, getLocaleUrl } from "@/i18n/metadata";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `How It Works - Learn Chess Online | ${SITE_CONFIG.name}`,
    description:
      `${SITE_CONFIG.name} helps you learn chess through interactive lessons, practice puzzles, and play against AI or real opponents. Start your chess journey today.`,
    keywords: [
      "how to learn chess",
      "interactive chess lessons",
      "practice chess puzzles",
      "play vs computer",
      "chess learning platform",
      "online chess tutorial",
    ],
    alternates: getLocaleAlternates(locale, "/how-it-works"),
    openGraph: {
      title: `How It Works - Learn Chess Online | ${SITE_CONFIG.name}`,
      description:
        `${SITE_CONFIG.name} helps you learn chess through interactive lessons, practice puzzles, and play against AI or real opponents.`,
      url: getLocaleUrl(locale, "/how-it-works"),
      siteName: SITE_CONFIG.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `How It Works - Learn Chess Online | ${SITE_CONFIG.name}`,
      description:
        `${SITE_CONFIG.name} helps you learn chess through interactive lessons, practice puzzles, and play against AI or real opponents.`,
    },
  };
}

const learningSteps = [
  {
    step: 1,
    titleKey: "step1Title",
    descriptionKey: "step1Desc",
    icon: BookOpen,
    color: "text-green-500",
  },
  {
    step: 2,
    titleKey: "step2Title",
    descriptionKey: "step2Desc",
    icon: GraduationCap,
    color: "text-blue-500",
  },
  {
    step: 3,
    titleKey: "step3Title",
    descriptionKey: "step3Desc",
    icon: Puzzle,
    color: "text-purple-500",
  },
  {
    step: 4,
    titleKey: "step4Title",
    descriptionKey: "step4Desc",
    icon: Play,
    color: "text-orange-500",
  },
  {
    step: 5,
    titleKey: "step5Title",
    descriptionKey: "step5Desc",
    icon: TrendingUp,
    color: "text-primary",
  },
];

const features = [
  {
    titleKey: "featureBasicsTitle",
    descriptionKey: "featureBasicsDesc",
    icon: CheckCircle,
    href: "/learn/chess-basics",
  },
  {
    titleKey: "featureOpeningTitle",
    descriptionKey: "featureOpeningDesc",
    icon: Target,
    href: "/learn/opening-principles",
  },
  {
    titleKey: "featureEndgamesTitle",
    descriptionKey: "featureEndgamesDesc",
    icon: Award,
    href: "/learn/essential-endgames",
  },
  {
    titleKey: "featureStrategyTitle",
    descriptionKey: "featureStrategyDesc",
    icon: Lightbulb,
    href: "/learn/strategic-thinking",
  },
];

const playModes = [
  {
    titleKey: "playAiTitle",
    descriptionKey: "playAiDesc",
    icon: Bot,
  },
  {
    titleKey: "playFriendsTitle",
    descriptionKey: "playFriendsDesc",
    icon: Users,
  },
  {
    titleKey: "matchmakingTitle",
    descriptionKey: "matchmakingDesc",
    icon: TrendingUp,
  },
];

const faqKeys = [
  { questionKey: "faqQ1", answerKey: "faqA1" },
  { questionKey: "faqQ2", answerKey: "faqA2" },
  { questionKey: "faqQ3", answerKey: "faqA3" },
  { questionKey: "faqQ4", answerKey: "faqA4" },
  { questionKey: "faqQ5", answerKey: "faqA5" },
  { questionKey: "faqQ6", answerKey: "faqA6" },
];

export default async function HowItWorksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: _locale } = await params;
  void _locale; // Required for async params handling
  const t = await getTranslations("howItWorks");

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
            {t("backToHome")}
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">{t("title")}</h1>
              <p className="text-muted-foreground text-lg">
                {t("subtitle", { appName: SITE_CONFIG.name })}
              </p>
            </div>
          </div>

          <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
            {t("heroIntro", { appName: SITE_CONFIG.name })}
          </p>
        </section>

        {/* Learning Steps Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">{t("learningJourneyTitle")}</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              {t("learningJourneyDesc")}
            </p>

            <div className="space-y-6">
              {learningSteps.map((step) => (
                <Card key={step.step} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full bg-background border-2 flex items-center justify-center ${step.color}`}>
                          <step.icon className="h-6 w-6" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
                            {t("stepN", { step: step.step })}
                          </span>
                          <h3 className="text-xl font-semibold">{t(step.titleKey)}</h3>
                        </div>
                        <p className="text-muted-foreground">{t(step.descriptionKey)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* What You Can Learn Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">{t("whatYouCanLearnTitle")}</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              {t("whatYouCanLearnDesc")}
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature) => (
                <Link key={feature.titleKey} href={feature.href}>
                  <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <feature.icon className="h-8 w-8 text-primary" />
                        <CardTitle className="text-lg">{t(feature.titleKey)}</CardTitle>
                      </div>
                      <CardDescription className="text-sm mt-2">
                        {t(feature.descriptionKey)}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button asChild size="lg">
                <Link href="/chess-guides">
                  {t("exploreAllGuides")}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Play Modes Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">{t("waysToPlayTitle")}</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              {t("waysToPlayDesc")}
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {playModes.map((mode) => (
                <Card key={mode.titleKey} className="h-full">
                  <CardHeader className="text-center">
                    <mode.icon className="h-12 w-12 mx-auto mb-2 text-primary" />
                    <CardTitle>{t(mode.titleKey)}</CardTitle>
                    <CardDescription>{t(mode.descriptionKey)}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button asChild size="lg" variant="outline">
                <Link href="/play">
                  {t("startPlaying")}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold mb-4 text-center">{t("faqTitle")}</h2>
            <p className="text-muted-foreground text-center mb-12">
              {t("faqDesc", { appName: SITE_CONFIG.name })}
            </p>

            <div className="space-y-4">
              {faqKeys.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{t(faq.questionKey, { appName: SITE_CONFIG.name })}</h3>
                    <p className="text-muted-foreground">{t(faq.answerKey, { appName: SITE_CONFIG.name })}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">{t("ctaTitle")}</h2>
            <p className="text-muted-foreground mb-8">
              {t("ctaDesc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/learn/chess-basics">
                  {t("ctaStart")}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/chess-guides">{t("ctaBrowse")}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqKeys.map((faq) => ({
              "@type": "Question",
              name: t(faq.questionKey, { appName: SITE_CONFIG.name }),
              acceptedAnswer: {
                "@type": "Answer",
                text: t(faq.answerKey, { appName: SITE_CONFIG.name }),
              },
            })),
          }),
        }}
      />
    </div>
  );
}
