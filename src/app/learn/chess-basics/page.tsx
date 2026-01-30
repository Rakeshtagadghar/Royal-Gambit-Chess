import { Metadata } from "next";
import Link from "next/link";
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

export const metadata: Metadata = {
  title: "Chess Basics - Learn How to Play Chess | RoyalGambit",
  description:
    "Learn chess fundamentals: how each piece moves, special rules like castling and en passant, check, checkmate, and stalemate. The complete beginner's guide to chess.",
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
  alternates: {
    canonical: `${BASE_URL}/learn/chess-basics`,
  },
  openGraph: {
    title: "Chess Basics - Learn How to Play Chess | RoyalGambit",
    description:
      "Learn chess fundamentals: how each piece moves, special rules like castling and en passant, check, checkmate, and stalemate.",
    url: `${BASE_URL}/learn/chess-basics`,
    siteName: "RoyalGambit",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chess Basics - Learn How to Play Chess | RoyalGambit",
    description:
      "Learn chess fundamentals: how each piece moves, special rules, check, checkmate, and stalemate.",
  },
};

const pieces = [
  {
    name: "The Pawn",
    symbol: "♟",
    value: "1 point",
    movement:
      "Pawns move forward one square, but capture diagonally. On their first move, they can advance two squares. When a pawn reaches the opposite end of the board, it promotes to any piece (usually a queen).",
    tips: [
      "Pawns are the soul of chess—their structure shapes the entire game",
      "Central pawns (d and e files) are especially valuable",
      "Connected pawns protect each other and are stronger together",
    ],
  },
  {
    name: "The Knight",
    symbol: "♞",
    value: "3 points",
    movement:
      "Knights move in an 'L' shape: two squares in one direction and one square perpendicular. They are the only piece that can jump over other pieces, making them excellent for tactical surprises.",
    tips: [
      "Knights are strongest in closed positions with many pawns",
      "A knight on the rim is dim—centralize your knights",
      "Knights and bishops are roughly equal in value",
    ],
  },
  {
    name: "The Bishop",
    symbol: "♝",
    value: "3 points",
    movement:
      "Bishops move diagonally any number of squares. Each bishop stays on the same color squares throughout the game. Having both bishops (the 'bishop pair') is considered an advantage.",
    tips: [
      "Bishops are powerful on open diagonals",
      "They work well together, covering squares of both colors",
      "A bad bishop is blocked by its own pawns",
    ],
  },
  {
    name: "The Rook",
    symbol: "♜",
    value: "5 points",
    movement:
      "Rooks move horizontally or vertically any number of squares. They are most powerful on open files (columns with no pawns) and on the seventh rank, attacking the opponent's pawns.",
    tips: [
      "Activate rooks by placing them on open files",
      "Connect your rooks—having them protect each other is strong",
      "Rooks belong behind passed pawns (yours or your opponent's)",
    ],
  },
  {
    name: "The Queen",
    symbol: "♛",
    value: "9 points",
    movement:
      "The queen combines the power of the rook and bishop, moving any number of squares horizontally, vertically, or diagonally. She is the most powerful piece on the board.",
    tips: [
      "Don't bring the queen out too early—she can be chased",
      "The queen excels at attacking multiple targets at once",
      "Avoid trading your queen for lesser pieces",
    ],
  },
  {
    name: "The King",
    symbol: "♚",
    value: "Invaluable",
    movement:
      "The king moves one square in any direction. While he cannot capture pieces that are defended, he becomes a powerful piece in the endgame when there are fewer threats.",
    tips: [
      "Keep your king safe in the opening and middlegame",
      "In the endgame, activate your king—he's a fighting piece",
      "Learn basic checkmate patterns with your king helping",
    ],
  },
];

const specialMoves = [
  {
    name: "Castling",
    icon: Castle,
    description:
      "Castling is a special move that accomplishes two things at once: it moves your king to safety and activates your rook. To castle, the king moves two squares toward a rook, and the rook jumps over to the other side of the king.",
    rules: [
      "Neither the king nor the rook can have moved before",
      "No pieces can be between the king and rook",
      "The king cannot be in check, move through check, or end in check",
      "You can castle kingside (short) or queenside (long)",
    ],
  },
  {
    name: "Pawn Promotion",
    icon: Crown,
    description:
      "When a pawn reaches the far end of the board (the 8th rank for White, 1st rank for Black), it must promote to another piece. You can choose a queen, rook, bishop, or knight. Most of the time, players promote to a queen since it's the strongest piece.",
    rules: [
      "Promotion is mandatory—you cannot keep it as a pawn",
      "You can have multiple queens (or other pieces) this way",
      "Sometimes promoting to a knight is best (for an immediate check)",
    ],
  },
  {
    name: "En Passant",
    icon: MoveRight,
    description:
      "En passant ('in passing' in French) is a special pawn capture. If an opponent's pawn advances two squares from its starting position and lands beside your pawn, you can capture it as if it had only moved one square. This must be done immediately on the next move.",
    rules: [
      "Only available immediately after the opponent's two-square pawn advance",
      "Your pawn must be on your 5th rank (or your opponent's 4th rank)",
      "The capture is made diagonally to the square the pawn passed through",
    ],
  },
];

const endConditions = [
  {
    name: "Check",
    icon: Zap,
    description:
      "When a piece attacks the opponent's king, the king is in 'check.' The player whose king is in check must get out of check on their next move. You can escape check by moving the king, blocking with another piece, or capturing the attacking piece.",
  },
  {
    name: "Checkmate",
    icon: Target,
    description:
      "Checkmate occurs when the king is in check and there is no legal move to escape. This ends the game—the player who delivers checkmate wins. Common checkmate patterns include the back-rank mate, scholar's mate, and the queen and king mate.",
  },
  {
    name: "Stalemate",
    icon: Shield,
    description:
      "Stalemate occurs when a player is not in check but has no legal moves. This results in a draw, not a win. Stalemate often happens in endgames when one side has overwhelming material but accidentally traps the opponent's king.",
  },
];

const basicCheckmates = [
  {
    name: "King and Queen Checkmate",
    description:
      "With just a king and queen against a lone king, you can force checkmate. The technique involves using your queen to cut off squares while your king helps drive the opponent's king to the edge of the board. The queen delivers the final blow, supported by the king.",
  },
  {
    name: "King and Rook Checkmate",
    description:
      "The king and rook checkmate requires more precision but follows similar principles. Use your rook to create a box, shrinking the area where the enemy king can move. Your king must help by covering escape squares. Checkmate happens on the edge of the board.",
  },
  {
    name: "Back Rank Checkmate",
    description:
      "A common pattern in actual games. When a king is trapped on the back rank by its own pawns and cannot escape, a rook or queen can deliver checkmate by landing on the back rank. Always give your king 'luft' (an escape square) to prevent this.",
  },
];

export default function ChessBasicsPage() {
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
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Crown className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-500 text-white">
                Beginner
              </span>
              <h1 className="text-4xl font-bold mt-1">Chess Basics</h1>
            </div>
          </div>

          <p className="text-lg text-muted-foreground mb-4 max-w-3xl">
            Welcome to your chess journey! This comprehensive guide covers everything you need
            to know to start playing chess. You&apos;ll learn how each piece moves, the special rules
            that make chess unique, and how games are won and lost.
          </p>
          <p className="text-muted-foreground max-w-3xl mb-8">
            Chess is a game of infinite depth, but the rules are straightforward. Take your time
            with each section, and soon you&apos;ll be ready to play your first games with confidence.
          </p>

          <Button asChild size="lg">
            <Link href="/learn/track/beginner-basics">
              Start Interactive Chess Basics Lessons
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </section>

        {/* Pieces Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">The Chess Pieces</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Each piece has its own movement pattern and strategic value. Learn them all to
              understand the battlefield.
            </p>

            <div className="space-y-6">
              {pieces.map((piece) => (
                <Card key={piece.name}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-shrink-0 text-center">
                        <span className="text-6xl">{piece.symbol}</span>
                        <div className="mt-2 text-sm font-semibold text-primary">
                          {piece.value}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{piece.name}</h3>
                        <p className="text-muted-foreground mb-4">{piece.movement}</p>
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Strategic Tips:</h4>
                          <ul className="space-y-1">
                            {piece.tips.map((tip, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                {tip}
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
            <h2 className="text-3xl font-bold mb-4 text-center">Special Moves</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Chess has three special moves that don&apos;t follow the normal piece movement rules.
              Knowing these is essential.
            </p>

            <div className="space-y-6">
              {specialMoves.map((move) => (
                <Card key={move.name}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <move.icon className="h-8 w-8 text-primary" />
                      <CardTitle className="text-xl">{move.name}</CardTitle>
                    </div>
                    <CardDescription className="text-base">
                      {move.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-semibold text-sm mb-2">Rules:</h4>
                    <ul className="space-y-1">
                      {move.rules.map((rule, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          {rule}
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
            <h2 className="text-3xl font-bold mb-4 text-center">Check, Checkmate & Stalemate</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Understanding how games end is crucial. These are the three most important concepts
              in chess.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {endConditions.map((condition) => (
                <Card key={condition.name} className="h-full">
                  <CardHeader>
                    <condition.icon className="h-10 w-10 text-primary mb-2" />
                    <CardTitle>{condition.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{condition.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Basic Checkmates */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">Essential Checkmate Patterns</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Every chess player should know these fundamental checkmate techniques
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {basicCheckmates.map((mate) => (
                <Card key={mate.name} className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{mate.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{mate.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-4">Ready for the Next Step?</h2>
            <p className="text-muted-foreground mb-8">
              Now that you understand how the pieces move and the rules of the game, it&apos;s time to
              learn how to start your games properly. Our Opening Principles guide teaches you the
              fundamentals that every strong player uses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/learn/track/beginner-basics">
                  Practice with Interactive Lessons
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/learn/opening-principles">
                  Continue to Opening Principles
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
            headline: "Chess Basics - Learn How to Play Chess",
            description:
              "Learn chess fundamentals: how each piece moves, special rules like castling and en passant, check, checkmate, and stalemate.",
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
                name: "Chess Basics",
                item: `${BASE_URL}/learn/chess-basics`,
              },
            ],
          }),
        }}
      />
    </div>
  );
}
