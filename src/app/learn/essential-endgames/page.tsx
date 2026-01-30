import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Flag,
  ArrowLeft,
  ChevronRight,
  Crown,
  Castle,
  Target,
  Lightbulb,
  CheckCircle,
  Star,
} from "lucide-react";
import { BASE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Essential Endgames - Master Chess Endgame Technique | RoyalGambit",
  description:
    "Learn critical chess endgame techniques: king activity, opposition, key squares, basic checkmates with queen and rook, and rook endgame principles. Convert advantages into wins.",
  keywords: [
    "chess endgames",
    "endgame technique",
    "king and pawn endgame",
    "rook endgame",
    "chess opposition",
    "checkmate patterns",
    "convert advantage chess",
  ],
  alternates: {
    canonical: `${BASE_URL}/learn/essential-endgames`,
  },
  openGraph: {
    title: "Essential Endgames - Master Chess Endgame Technique | RoyalGambit",
    description:
      "Learn critical chess endgame techniques: king activity, opposition, key squares, basic checkmates, and rook endgame principles.",
    url: `${BASE_URL}/learn/essential-endgames`,
    siteName: "RoyalGambit",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Essential Endgames - Master Chess Endgame Technique | RoyalGambit",
    description:
      "Learn critical chess endgame techniques: king activity, opposition, basic checkmates, and rook endgames.",
  },
};

const concepts = [
  {
    title: "King Activity",
    icon: Crown,
    importance: "Critical",
    description:
      "In the endgame, your king transforms from a piece that needs protection to a powerful attacking force. Unlike the middlegame where the king hides, the endgame king should march into the center and help your pawns advance or attack the opponent's pawns.",
    tips: [
      "Activate your king early in the endgame—don't leave it on the back rank",
      "The king can attack and defend simultaneously from the center",
      "A centralized king often makes the difference between winning and drawing",
      "Use your king to support pawn promotion or create mating threats",
    ],
  },
  {
    title: "Opposition",
    icon: Target,
    importance: "Essential",
    description:
      "Opposition occurs when two kings face each other with one square between them, and it's not their turn to move. The player without the move has 'the opposition' and gains a crucial advantage in king and pawn endgames by forcing the opponent's king to give way.",
    tips: [
      "Direct opposition: kings face each other with one square between",
      "The side NOT to move holds the opposition",
      "In pawn endgames, opposition often decides the outcome",
      "Distant opposition (with odd number of squares) also matters",
    ],
  },
  {
    title: "Key Squares",
    icon: Star,
    importance: "Important",
    description:
      "Key squares are critical squares that, if your king reaches them, guarantee pawn promotion regardless of the opponent's play. Learning key squares for common pawn positions eliminates guesswork—you know exactly what to aim for.",
    tips: [
      "For a pawn on the 5th rank, key squares are directly ahead and diagonally ahead",
      "Reaching a key square before the opponent means you're winning",
      "Key squares exist for passed pawns at every position on the board",
      "Understanding key squares helps you evaluate endgames accurately",
    ],
  },
  {
    title: "The Rule of the Square",
    icon: Lightbulb,
    importance: "Practical",
    description:
      "A quick way to calculate if a king can catch a passed pawn: imagine a square from the pawn to its promotion square. If the defending king can step into this square (on their move), they can catch the pawn. If not, the pawn promotes.",
    tips: [
      "Draw a diagonal from the pawn to the 8th rank—that's one corner of the square",
      "The square extends back to the pawn's current rank",
      "If the king is inside or can enter the square, the pawn is caught",
      "This rule saves time in calculation during actual games",
    ],
  },
];

const basicMates = [
  {
    title: "King and Queen vs King",
    difficulty: "Basic",
    description:
      "The easiest checkmate to deliver. Use your queen to cut off squares, forcing the enemy king to the edge of the board. Then bring your king close to help deliver the final blow. Be careful not to stalemate!",
    technique: [
      "Use the queen to create a box, restricting the king's movement",
      "Gradually shrink the box, pushing the king toward the edge",
      "Bring your king to support the queen",
      "Deliver checkmate on the edge—watch out for stalemate!",
    ],
  },
  {
    title: "King and Rook vs King",
    difficulty: "Intermediate",
    description:
      "Requires more precision than the queen mate. Use your rook to cut off ranks or files, creating a shrinking box. Your king must help by controlling key squares. The checkmate happens on the edge of the board.",
    technique: [
      "Cut off the enemy king with the rook (horizontally or vertically)",
      "Move your king toward the enemy king, maintaining the rook's cut-off",
      "Use 'waiting moves' with the rook when needed",
      "Drive the king to the edge and deliver checkmate with king support",
    ],
  },
  {
    title: "Two Bishops Checkmate",
    difficulty: "Advanced",
    description:
      "Two bishops work beautifully together, covering all squares of both colors. Drive the king to a corner using a diagonal barrier created by the bishops, then deliver checkmate with the bishops and king coordinating.",
    technique: [
      "Bishops create a diagonal barrier the king cannot cross",
      "Centralize your king and gradually push the enemy king toward a corner",
      "The bishops work together, each covering the other's weak color",
      "Checkmate occurs in the corner with precise bishop coordination",
    ],
  },
];

const rookEndgames = [
  {
    title: "Rook Activity",
    principle:
      "Active rooks are worth significantly more than passive ones. An active rook attacks pawns, cuts off the enemy king, and creates threats. A passive rook that's stuck defending is often losing even with equal material.",
    tips: [
      "Rooks belong on open files where they have maximum scope",
      "The 7th rank is powerful—rooks attack pawns from behind",
      "Don't let your rook become a passive defender of weak pawns",
    ],
  },
  {
    title: "Rooks Behind Passed Pawns",
    principle:
      "Place your rook behind passed pawns—yours OR your opponent's. Behind your own pawn, the rook supports its advance without blocking it. Behind an opponent's pawn, the rook can capture it when it advances.",
    tips: [
      "A rook behind a passed pawn gains power as the pawn advances",
      "A rook in front of a passed pawn loses squares as the pawn advances",
      "This principle applies to both offensive and defensive scenarios",
    ],
  },
  {
    title: "Lucena Position",
    principle:
      "The most important winning technique in rook endgames. When you have a rook and a passed pawn on the 7th rank with your king in front of the pawn, the 'bridge building' technique guarantees promotion.",
    tips: [
      "Your king shields from checks by moving to the 4th rank",
      "Your rook builds a 'bridge' on the 4th rank, blocking checks",
      "Once the bridge is built, the pawn promotes safely",
    ],
  },
  {
    title: "Philidor Position",
    principle:
      "The critical defensive technique in rook endgames. When defending against a rook and passed pawn, keep your rook on the 3rd rank until the pawn advances to the 6th, then go behind the pawn for checks.",
    tips: [
      "Maintain your rook on the 3rd rank as a barrier",
      "When the pawn reaches the 6th rank, move to the back rank",
      "Continuous checks from behind prevent the pawn from promoting",
    ],
  },
];

const knowledgeLevels = [
  {
    level: "Must Know",
    color: "bg-red-500",
    items: ["King + Queen vs King mate", "King + Rook vs King mate", "Opposition", "King activity"],
  },
  {
    level: "Should Know",
    color: "bg-orange-500",
    items: ["Key squares", "Rule of the square", "Lucena position", "Philidor position"],
  },
  {
    level: "Good to Know",
    color: "bg-blue-500",
    items: ["Two bishops mate", "Rook activity principles", "Rooks behind passed pawns"],
  },
];

export default function EssentialEndgamesPage() {
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
              <Flag className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-500 text-white">
                Intermediate
              </span>
              <h1 className="text-4xl font-bold mt-1">Essential Endgames</h1>
            </div>
          </div>

          <p className="text-lg text-muted-foreground mb-4 max-w-3xl">
            &quot;In order to improve your game, you must study the endgame before everything else.&quot;
            — José Raúl Capablanca, World Champion. The endgame is where games are decided—
            knowing these techniques will help you convert advantages and save difficult positions.
          </p>
          <p className="text-muted-foreground max-w-3xl mb-8">
            Unlike openings where memorization has limited value, endgame knowledge pays dividends
            forever. These patterns and techniques are timeless fundamentals that separate
            winning players from those who let victories slip away.
          </p>

          <Button asChild size="lg">
            <Link href="/learn/track/intermediate-endgames">
              Start Interactive Endgame Lessons
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </section>

        {/* Core Concepts Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">King and Pawn Endgame Concepts</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Master these foundational concepts that apply to nearly every endgame
            </p>

            <div className="space-y-6">
              {concepts.map((concept) => (
                <Card key={concept.title}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <concept.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-xl">{concept.title}</CardTitle>
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/20 text-primary">
                            {concept.importance}
                          </span>
                        </div>
                        <CardDescription className="text-base">
                          {concept.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-semibold text-sm mb-2">Key Points:</h4>
                    <ul className="grid md:grid-cols-2 gap-2">
                      {concept.tips.map((tip, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Basic Checkmates Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">Basic Checkmates</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Every chess player must know how to deliver these fundamental checkmates
            </p>

            <div className="space-y-6">
              {basicMates.map((mate) => (
                <Card key={mate.title}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{mate.title}</CardTitle>
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-muted">
                        {mate.difficulty}
                      </span>
                    </div>
                    <CardDescription className="text-base">
                      {mate.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-semibold text-sm mb-2">Technique:</h4>
                    <ol className="space-y-1">
                      {mate.technique.map((step, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0">
                            {index + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Rook Endgames Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">Rook Endgame Fundamentals</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Rook endgames are the most common. Master these principles to play them well.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {rookEndgames.map((item) => (
                <Card key={item.title} className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Castle className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">{item.principle}</p>
                    <ul className="space-y-1">
                      {item.tips.map((tip, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Knowledge Priority */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold mb-4 text-center">What to Learn First</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Prioritize your endgame study with this guide
            </p>

            <div className="space-y-4">
              {knowledgeLevels.map((level) => (
                <Card key={level.level}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`${level.color} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
                        {level.level}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {level.items.map((item) => (
                        <span key={item} className="text-sm bg-muted px-3 py-1 rounded-md">
                          {item}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-4">Complete Your Chess Education</h2>
            <p className="text-muted-foreground mb-8">
              With solid endgame technique, you&apos;re ready to develop deep strategic thinking.
              Our Strategic Thinking guide teaches you how to evaluate positions, create plans,
              and understand the nuances that separate good players from great ones.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/learn/track/intermediate-endgames">
                  Practice with Interactive Lessons
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/learn/strategic-thinking">
                  Continue to Strategic Thinking
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
            headline: "Essential Endgames - Master Chess Endgame Technique",
            description:
              "Learn critical chess endgame techniques: king activity, opposition, key squares, basic checkmates with queen and rook, and rook endgame principles.",
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
                name: "Essential Endgames",
                item: `${BASE_URL}/learn/essential-endgames`,
              },
            ],
          }),
        }}
      />
    </div>
  );
}
