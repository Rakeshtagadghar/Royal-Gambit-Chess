import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Crown,
  ArrowLeft,
  ChevronRight,
  Shield,
  Castle,
  MoveRight,
  Target,
  Zap,
  CheckCircle,
} from "lucide-react";
import { BASE_URL } from "@/lib/config";
import { getLocaleAlternates, getLocaleUrl } from "@/i18n/metadata";

import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "chessBasics" });

  return {
    title: "Chess Basics - Learn How to Play Chess | RoyalGambit",
    description: t("heroDesc"), // Using hero desc as meta desc
    keywords: [
      "learn chess",
      "chess basics",
      "how to play chess",
      "chess rules",
      "chess pieces",
      "chess for beginners",
      "castling",
      "en passant",
      "checkmate",
    ],
    alternates: getLocaleAlternates(locale, "/learn/chess-basics"),
    openGraph: {
      title: "Chess Basics - Learn How to Play Chess | RoyalGambit",
      description: t("heroDesc"),
      url: getLocaleUrl(locale, "/learn/chess-basics"),
      siteName: "RoyalGambit",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: "Chess Basics - Learn How to Play Chess | RoyalGambit",
      description: t("heroDesc"),
    },
  };
}

const pieces = [
  {
    nameKey: "piecePawnName",
    symbol: "♟",
    valueKey: "piecePawnValue",
    movementKey: "piecePawnMovement",
    tipKeys: ["piecePawnTip1", "piecePawnTip2", "piecePawnTip3"],
  },
  {
    nameKey: "pieceKnightName",
    symbol: "♞",
    valueKey: "pieceKnightValue",
    movementKey: "pieceKnightMovement",
    tipKeys: ["pieceKnightTip1", "pieceKnightTip2", "pieceKnightTip3"],
  },
  {
    nameKey: "pieceBishopName",
    symbol: "♝",
    valueKey: "pieceBishopValue",
    movementKey: "pieceBishopMovement",
    tipKeys: ["pieceBishopTip1", "pieceBishopTip2", "pieceBishopTip3"],
  },
  {
    nameKey: "pieceRookName",
    symbol: "♜",
    valueKey: "pieceRookValue",
    movementKey: "pieceRookMovement",
    tipKeys: ["pieceRookTip1", "pieceRookTip2", "pieceRookTip3"],
  },
  {
    nameKey: "pieceQueenName",
    symbol: "♛",
    valueKey: "pieceQueenValue",
    movementKey: "pieceQueenMovement",
    tipKeys: ["pieceQueenTip1", "pieceQueenTip2", "pieceQueenTip3"],
  },
  {
    nameKey: "pieceKingName",
    symbol: "♚",
    valueKey: "pieceKingValue",
    movementKey: "pieceKingMovement",
    tipKeys: ["pieceKingTip1", "pieceKingTip2", "pieceKingTip3"],
  },
];

const specialMoves = [
  {
    nameKey: "moveCastlingName",
    icon: Castle,
    descriptionKey: "moveCastlingDesc",
    ruleKeys: ["moveCastlingRule1", "moveCastlingRule2", "moveCastlingRule3", "moveCastlingRule4"],
  },
  {
    nameKey: "movePromotionName",
    icon: Crown,
    descriptionKey: "movePromotionDesc",
    ruleKeys: ["movePromotionRule1", "movePromotionRule2", "movePromotionRule3"],
  },
  {
    nameKey: "moveEnPassantName",
    icon: MoveRight,
    descriptionKey: "moveEnPassantDesc",
    ruleKeys: ["moveEnPassantRule1", "moveEnPassantRule2", "moveEnPassantRule3"],
  },
];

const endConditions = [
  {
    nameKey: "condCheckName",
    icon: Zap,
    descriptionKey: "condCheckDesc",
  },
  {
    nameKey: "condCheckmateName",
    icon: Target,
    descriptionKey: "condCheckmateDesc",
  },
  {
    nameKey: "condStalemateName",
    icon: Shield,
    descriptionKey: "condStalemateDesc",
  },
];

const basicCheckmates = [
  {
    nameKey: "mateKQName",
    descriptionKey: "mateKQDesc",
  },
  {
    nameKey: "mateKRName",
    descriptionKey: "mateKRDesc",
  },
  {
    nameKey: "mateBackRankName",
    descriptionKey: "mateBackRankDesc",
  },
];

// Note: Update structured data in the return statement as well with translated values if possible or keep hardcoded for search engines (often okay, but dynamic is better)
// For simplicity in this step, I will only update the visible JSX content.

export default async function ChessBasicsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("chessBasics");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 max-w-5xl">
          <Link
            href="/chess-guides"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToGuides")}
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Crown className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-500 text-white">
                {t("heroStats")}
              </span>
              <h1 className="text-4xl font-bold mt-1">{t("title")}</h1>
            </div>
          </div>

          <p className="text-lg text-muted-foreground mb-4 max-w-3xl">
            {t("heroIntro")}
          </p>
          <p className="text-muted-foreground max-w-3xl mb-8">
            {t("heroDesc")}
          </p>

          <Button asChild size="lg">
            <Link href="/learn/track/beginner-basics">
              {t("startInteractive")}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </section>

        {/* Pieces Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">{t("piecesTitle")}</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              {t("piecesDesc")}
            </p>

            <div className="space-y-6">
              {pieces.map((piece) => (
                <Card key={piece.nameKey}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-shrink-0 text-center">
                        <span className="text-6xl">{piece.symbol}</span>
                        <div className="mt-2 text-sm font-semibold text-primary">
                          {t(piece.valueKey)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{t(piece.nameKey)}</h3>
                        <p className="text-muted-foreground mb-4">{t(piece.movementKey)}</p>
                        <div>
                          <h4 className="font-semibold text-sm mb-2">{t("strategicTips")}</h4>
                          <ul className="space-y-1">
                            {piece.tipKeys.map((tipKey, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                {t(tipKey)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Special Moves Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">{t("specialMovesTitle")}</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              {t("specialMovesDesc")}
            </p>

            <div className="space-y-6">
              {specialMoves.map((move) => (
                <Card key={move.nameKey}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <move.icon className="h-8 w-8 text-primary" />
                      <CardTitle className="text-xl">{t(move.nameKey)}</CardTitle>
                    </div>
                    <CardDescription className="text-base">
                      {t(move.descriptionKey)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-semibold text-sm mb-2">{t("specialRules")}</h4>
                    <ul className="space-y-1">
                      {move.ruleKeys.map((ruleKey, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          {t(ruleKey)}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Game End Conditions */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">{t("endConditionsTitle")}</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              {t("endConditionsDesc")}
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {endConditions.map((condition) => (
                <Card key={condition.nameKey} className="h-full">
                  <CardHeader>
                    <condition.icon className="h-10 w-10 text-primary mb-2" />
                    <CardTitle>{t(condition.nameKey)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{t(condition.descriptionKey)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Basic Checkmates */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">{t("checkmatesTitle")}</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              {t("checkmatesDesc")}
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {basicCheckmates.map((mate) => (
                <Card key={mate.nameKey} className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{t(mate.nameKey)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{t(mate.descriptionKey)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-4">{t("nextStepsTitle")}</h2>
            <p className="text-muted-foreground mb-8">
              {t("nextStepsDesc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/learn/track/beginner-basics">
                  {t("practiceInteractive")}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/learn/opening-principles">
                  {t("continueToOpening")}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `${t("title")} - ${t("subtitle")}`,
            description: t("heroDesc"),
            author: {
              "@type": "Organization",
              name: "RoyalGambit",
            },
            publisher: {
              "@type": "Organization",
              name: "RoyalGambit",
            },
          }),
        }}
      />

      {/* Breadcrumb Structured Data */}
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
              {
                "@type": "ListItem",
                position: 3,
                name: "Chess Basics",
                item: `${BASE_URL}/${locale}/learn/chess-basics`,
              },
            ],
          }),
        }}
      />
    </div>
  );
}
