'use client';

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowLeft, Crown, Target, Heart, ChevronRight } from "lucide-react";

export default function AboutPage() {
  const t = useTranslations('about');

  const offerings = [
    { key: 'playOnline', label: t('offerPlayOnlineLabel'), desc: t('offerPlayOnlineDesc') },
    { key: 'practiceBots', label: t('offerPracticeBotsLabel'), desc: t('offerPracticeBotsDesc') },
    { key: 'learnChess', label: t('offerLearnChessLabel'), desc: t('offerLearnChessDesc') },
    { key: 'gameReview', label: t('offerGameReviewLabel'), desc: t('offerGameReviewDesc') },
    { key: 'leaderboards', label: t('offerLeaderboardsLabel'), desc: t('offerLeaderboardsDesc') },
    { key: 'gameArchives', label: t('offerGameArchivesLabel'), desc: t('offerGameArchivesDesc') },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToHome')}
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">{t('subtitle')}</p>
          </div>
        </div>

        <Card className="mb-8">
          <CardContent className="prose prose-invert max-w-none p-6 md:p-8">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                {t('missionTitle')}
              </h2>
              <p className="text-muted-foreground mb-4">
                {t('missionParagraph1')}
              </p>
              <p className="text-muted-foreground">
                {t('missionParagraph2')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                {t('whatWeOfferTitle')}
              </h2>
              <ul className="text-muted-foreground list-disc list-inside space-y-2">
                {offerings.map((item) => (
                  <li key={item.key}>
                    <strong>{item.label}</strong> {item.desc}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                {t('ourTeamTitle')}
              </h2>
              <div className="bg-secondary/30 rounded-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{t('founderInitials')}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{t('founderName')}</h3>
                    <p className="text-primary text-sm">{t('founderRole')}</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      {t('founderBio')}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">{t('getInTouchTitle')}</h2>
              <p className="text-muted-foreground">
                {t('getInTouchText')}
                <Link href="/contact" className="text-primary hover:underline">
                  {t('contactUsLink')}
                </Link>
                {t('getInTouchPageOr')}
                <a href="mailto:rakeshtagadghar@gmail.com" className="text-primary hover:underline">
                  rakeshtagadghar@gmail.com
                </a>
              </p>
            </section>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold mb-4">{t('ctaTitle')}</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            {t('ctaDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/learn/chess-basics">
                {t('ctaStartLearning')}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/play">{t('ctaPlayNow')}</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
