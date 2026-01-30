import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Swords,
  ArrowLeft,
  ChevronRight,
  Target,
  Shield,
  Crown,
  Lightbulb,
  XCircle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { BASE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Opening Principles - Master Chess Openings | RoyalGambit",
  description:
    "Learn essential chess opening principles: control the center, develop pieces, castle for king safety, and avoid common mistakes. Build a solid foundation for every game.",
  keywords: [
    "chess openings",
    "opening principles",
    "chess development",
    "center control chess",
    "king safety chess",
    "chess opening mistakes",
    "how to start chess game",
  ],
  alternates: {
    canonical: `${BASE_URL}/learn/opening-principles`,
  },
  openGraph: {
    title: "Opening Principles - Master Chess Openings | RoyalGambit",
    description:
      "Learn essential chess opening principles: control the center, develop pieces, castle for king safety, and avoid common mistakes.",
    url: `${BASE_URL}/learn/opening-principles`,
    siteName: "RoyalGambit",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Opening Principles - Master Chess Openings | RoyalGambit",
    description:
      "Learn essential chess opening principles: control the center, develop pieces, castle for king safety.",
  },
};

const principles = [
  {
    number: 1,
    title: "Control the Center",
    icon: Target,
    description:
      "The center squares (d4, d5, e4, e5) are the most important squares on the board. Pieces placed in or near the center control more squares and can reach both sides of the board quickly. Pawns in the center also restrict your opponent's pieces.",
    tips: [
      "Open with 1.e4 or 1.d4 to immediately stake a claim in the center",
      "If you can't occupy the center with pawns, control it with pieces",
      "Don't let your opponent dominate the center without a fight",
      "A strong center gives you more space and better piece mobility",
    ],
    examples: [
      "1.e4 is the most popular opening move, controlling d5 and f5 while opening lines for the queen and bishop",
      "1.d4 is equally strong, controlling c5 and e5 while supporting a later c4 push",
    ],
  },
  {
    number: 2,
    title: "Develop Your Pieces",
    icon: Swords,
    description:
      "In the opening, your goal is to activate your pieces—get them off their starting squares and onto useful positions. Knights and bishops should come out first, followed by connecting your rooks. Each move should improve your position.",
    tips: [
      "Develop knights before bishops (knights have fewer good squares)",
      "Don't move the same piece twice unless there's a good reason",
      "Develop toward the center where pieces are most effective",
      "Aim to develop all minor pieces (knights and bishops) before move 10",
    ],
    examples: [
      "After 1.e4 e5, moves like 2.Nf3 develop with tempo by attacking e5",
      "The Italian Game (1.e4 e5 2.Nf3 Nc6 3.Bc4) develops pieces toward the center and the enemy king",
    ],
  },
  {
    number: 3,
    title: "Castle Early for King Safety",
    icon: Shield,
    description:
      "Your king is vulnerable in the center where files can open. Castling tucks your king into a safer corner behind pawns while activating your rook. Most players castle kingside within the first 10 moves.",
    tips: [
      "Castle early—preferably before move 10",
      "Don't push the pawns in front of your castled king without good reason",
      "Kingside castling is faster and usually safer",
      "Queenside castling can be aggressive but leaves the a-pawn weaker",
    ],
    examples: [
      "After 1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5, both sides can castle kingside on the next move",
      "Delaying castling too long often leads to attacks against your exposed king",
    ],
  },
  {
    number: 4,
    title: "Don't Bring the Queen Out Early",
    icon: Crown,
    description:
      "While the queen is powerful, bringing her out too early makes her a target. Your opponent can develop pieces with tempo by attacking your queen, gaining time while you retreat. Save the queen for after development is complete.",
    tips: [
      "Develop minor pieces first—the queen should come out later",
      "If you must move the queen early, put her on a safe square",
      "Don't chase material with your queen if it costs too much time",
      "The queen is a powerful piece for the middlegame, not the opening",
    ],
    examples: [
      "In the Scholar's Mate attempt (1.e4 e5 2.Qh5?!), White's queen can be kicked around",
      "Strong players rarely move the queen before developing at least two minor pieces",
    ],
  },
  {
    number: 5,
    title: "Connect Your Rooks",
    icon: Lightbulb,
    description:
      "Once your minor pieces are developed and you've castled, aim to connect your rooks—place them on the back rank with no pieces between them. Connected rooks defend each other and are ready to occupy open files.",
    tips: [
      "Develop knights, bishops, castle, then bring the queen to connect rooks",
      "Connected rooks can double on open files for maximum pressure",
      "Look for half-open or open files for your rooks",
      "The rook belongs on files where there's action or potential",
    ],
    examples: [
      "A typical development sequence: Nf3, Bc4, O-O, d3, Nbd2, Qe2 leaves rooks connected",
      "After trading pieces, rooks become more valuable as the board opens up",
    ],
  },
];

const mistakes = [
  {
    mistake: "Moving the same piece multiple times",
    why: "Each move should develop a new piece. Moving the same piece twice means you're falling behind in development.",
    icon: XCircle,
  },
  {
    mistake: "Neglecting development to grab pawns",
    why: "Winning a pawn isn't worth falling 3-4 moves behind in development. Your opponent will attack before you're ready.",
    icon: AlertTriangle,
  },
  {
    mistake: "Making too many pawn moves",
    why: "Pawns don't develop pieces. One or two pawn moves to control the center is enough—then develop!",
    icon: XCircle,
  },
  {
    mistake: "Bringing the queen out too early",
    why: "The queen is a target. Your opponent gains time attacking her while developing their own pieces.",
    icon: AlertTriangle,
  },
  {
    mistake: "Forgetting to castle",
    why: "A king in the center is vulnerable to attacks. Castle early to ensure your king is safe.",
    icon: XCircle,
  },
  {
    mistake: "Blocking the c-pawn with the knight on c3",
    why: "In many openings, you want to play c4. Nbd2 keeps this option open.",
    icon: AlertTriangle,
  },
];

const openingPhilosophy = [
  {
    title: "Principles Over Memorization",
    description:
      "Understanding why moves are good is more valuable than memorizing lines. If you understand opening principles, you can play any position reasonably well. Memorized lines fail when opponents deviate.",
  },
  {
    title: "Piece Activity Matters Most",
    description:
      "The player with more active pieces usually has the advantage. Ask yourself: which pieces are doing nothing? How can I activate them? Even a slight edge in activity compounds over many moves.",
  },
  {
    title: "Time is Precious",
    description:
      "Every tempo (move) matters in the opening. Wasting a move is like giving your opponent a free turn. Each move should either develop a piece, improve pawn structure, or create a threat.",
  },
  {
    title: "Know Your Plans, Not Just Moves",
    description:
      "Rather than memorizing move orders, understand the plans behind each opening. What are the typical pawn breaks? Where do the pieces belong? What are the attacking and defensive ideas?",
  },
];

export default function OpeningPrinciplesPage() {
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
            Back to Chess Guides
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Swords className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-500 text-white">
                Intermediate
              </span>
              <h1 className="text-4xl font-bold mt-1">Opening Principles</h1>
            </div>
          </div>

          <p className="text-lg text-muted-foreground mb-4 max-w-3xl">
            The opening sets the tone for the entire game. While there are thousands of named
            openings and millions of analyzed positions, the underlying principles remain the
            same. Master these fundamentals, and you'll be prepared for any position.
          </p>
          <p className="text-muted-foreground max-w-3xl mb-8">
            This guide focuses on understanding rather than memorization. You don't need to
            know specific opening lines—just follow these principles, and you'll emerge from
            the opening with a solid, playable position every time.
          </p>

          <Button asChild size="lg">
            <Link href="/learn/track/intermediate-openings">
              Start Interactive Opening Lessons
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </section>

        {/* Core Principles Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">The Five Core Principles</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Follow these principles in every game, and you'll build strong positions naturally
            </p>

            <div className="space-y-8">
              {principles.map((principle) => (
                <Card key={principle.number}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                        {principle.number}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <principle.icon className="h-5 w-5 text-blue-500" />
                          <CardTitle className="text-xl">{principle.title}</CardTitle>
                        </div>
                        <CardDescription className="text-base">
                          {principle.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Key Points:</h4>
                        <ul className="space-y-1">
                          {principle.tips.map((tip, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Examples:</h4>
                        <ul className="space-y-2">
                          {principle.examples.map((example, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Common Mistakes Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">Common Opening Mistakes</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Avoid these pitfalls that plague beginner and intermediate players
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {mistakes.map((item, index) => (
                <Card key={index} className="border-destructive/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <item.icon className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-sm mb-1">{item.mistake}</h3>
                        <p className="text-sm text-muted-foreground">{item.why}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Opening Philosophy */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">Opening Philosophy</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              The mindset that strong players bring to the opening phase
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {openingPhilosophy.map((item, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-4">What's Next?</h2>
            <p className="text-muted-foreground mb-8">
              With solid opening principles under your belt, it's time to learn how to finish
              games. The endgame is where many games are won and lost—understanding basic
              endgame technique will help you convert advantages and save difficult positions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/learn/track/intermediate-openings">
                  Practice with Interactive Lessons
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/learn/essential-endgames">
                  Continue to Essential Endgames
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
            headline: "Opening Principles - Master Chess Openings",
            description:
              "Learn essential chess opening principles: control the center, develop pieces, castle for king safety, and avoid common mistakes.",
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
                item: `${BASE_URL}/chess-guides`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: "Opening Principles",
                item: `${BASE_URL}/learn/opening-principles`,
              },
            ],
          }),
        }}
      />
    </div>
  );
}
