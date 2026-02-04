import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Brain,
  ArrowLeft,
  ChevronRight,
  Scale,
  Grid3X3,
  Eye,
  Shield,
  TrendingUp,
  Zap,
  CheckCircle,
  Layers,
} from "lucide-react";
import { BASE_URL } from "@/lib/config";
import { getLocaleAlternates, getLocaleUrl } from "@/i18n/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Strategic Thinking - Advanced Chess Strategy | RoyalGambit",
    description:
      "Master advanced chess strategy: position evaluation using imbalances, pawn structure plans, outposts, good vs bad bishops, prophylaxis, and converting advantages.",
    keywords: [
      "chess strategy",
      "positional chess",
      "chess imbalances",
      "pawn structure",
      "prophylaxis",
      "chess planning",
      "advanced chess",
      "positional understanding",
    ],
    alternates: getLocaleAlternates(locale, "/learn/strategic-thinking"),
    openGraph: {
      title: "Strategic Thinking - Advanced Chess Strategy | RoyalGambit",
      description:
        "Master advanced chess strategy: position evaluation, pawn structures, outposts, prophylaxis, and converting advantages.",
      url: getLocaleUrl(locale, "/learn/strategic-thinking"),
      siteName: "RoyalGambit",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: "Strategic Thinking - Advanced Chess Strategy | RoyalGambit",
      description:
        "Master advanced chess strategy: position evaluation, pawn structures, outposts, and prophylaxis.",
    },
  };
}

const imbalances = [
  {
    name: "Material",
    description:
      "The most basic imbalance: who has more pieces? But material isn't everything—a piece that does nothing is worth less than one actively participating in the fight.",
    considerations: [
      "Quality over quantity: active pieces beat passive ones",
      "A knight for three pawns can favor either side",
      "Material advantage means nothing if you can't use it",
    ],
  },
  {
    name: "Piece Activity",
    description:
      "How actively placed are the pieces? An active piece participates in attack and defense, while a passive piece is restricted or doing nothing useful.",
    considerations: [
      "A temporarily sacrificed piece for activity can be worth it",
      "Look for ways to activate your worst-placed piece",
      "Restrict your opponent's pieces whenever possible",
    ],
  },
  {
    name: "Pawn Structure",
    description:
      "Pawns determine the character of the position. Isolated, doubled, or backward pawns can be weaknesses, while passed pawns and pawn majorities are assets.",
    considerations: [
      "Pawn weaknesses become targets in the endgame",
      "Pawn structure determines which pieces are good or bad",
      "Creating a passed pawn is often the key to winning",
    ],
  },
  {
    name: "Space",
    description:
      "Space refers to how much territory your pieces can access. More space means more options for your pieces and more restrictions on your opponent's.",
    considerations: [
      "Space advantage requires active pieces to exploit",
      "With less space, trade pieces to ease the cramp",
      "Don't overextend—space without piece support is weakness",
    ],
  },
  {
    name: "King Safety",
    description:
      "An unsafe king is a target. Pawn weaknesses around the king, open lines pointing at the king, or a king stuck in the center create attacking opportunities.",
    considerations: [
      "The opposite-colored bishops favor the attacker",
      "Open files toward the king are highways for rooks",
      "Sometimes keeping the king in the center is correct",
    ],
  },
  {
    name: "Control of Key Squares",
    description:
      "Certain squares are more important than others—outposts, central squares, invasion squares. Controlling these squares provides long-term advantages.",
    considerations: [
      "Knights excel on outposts protected by pawns",
      "Control of open files often means control of the position",
      "Weak color complexes can be exploited systematically",
    ],
  },
];

const pawnStructures = [
  {
    name: "Isolated Queen's Pawn (IQP)",
    description:
      "A pawn on d4 or d5 with no pawns on adjacent files. It's a dynamic structure: the pawn provides central control and piece activity, but can become a weakness in the endgame.",
    playsFor: "Piece activity, attacks, avoiding simplification",
    playsAgainst: "Blockade on d5, piece exchanges, endgame play",
    icon: Grid3X3,
  },
  {
    name: "Hanging Pawns",
    description:
      "Pawns on c4 and d4 (or c5/d5) without support from adjacent pawns. Mobile and controlling central squares, but they can become targets or advance and create weaknesses.",
    playsFor: "Central pawn breaks (d5 or c5), piece activity",
    playsAgainst: "Pressure on the pawns, forcing them to advance",
    icon: Layers,
  },
  {
    name: "Pawn Chains",
    description:
      "Pawns connected diagonally (like d4-e5 or d5-e6). The base of the chain is typically the weakness. Strategy involves attacking the base or undermining with pawns.",
    playsFor: "Advance the chain, attack on the spearhead side",
    playsAgainst: "Attack the base of the chain with pawns",
    icon: TrendingUp,
  },
  {
    name: "Doubled Pawns",
    description:
      "Two pawns on the same file. They can be weak (lacking mobility, hard to defend) or strong (controlling key squares, opening files for rooks).",
    playsFor: "Use the open file, central control from doubled pawns",
    playsAgainst: "Target the doubled pawns, blockade them",
    icon: Layers,
  },
];

const strategicConcepts = [
  {
    title: "Outposts",
    icon: Shield,
    description:
      "An outpost is a square protected by a pawn that cannot be attacked by enemy pawns. Knights are especially strong on outposts because they can't be driven away and control many squares from a fixed position.",
    tips: [
      "Look for squares in the opponent's half that your pawns protect",
      "Knights on outposts can be worth more than rooks",
      "Trade off pieces that could challenge your outpost",
      "The ideal outpost is in the center or near the enemy king",
    ],
  },
  {
    title: "Good vs Bad Bishops",
    icon: Eye,
    description:
      "A 'bad' bishop is blocked by its own pawns (pawns on the same color squares). A 'good' bishop has its pawns on the opposite color, giving it open diagonals and targets to attack.",
    tips: [
      "Put pawns on opposite color to your remaining bishop",
      "Trade your bad bishop or activate it outside the pawn chain",
      "In opposite-colored bishop endings, the attacker often has advantage",
      "Two bishops working together are very powerful",
    ],
  },
  {
    title: "Prophylaxis",
    icon: Zap,
    description:
      "Prophylaxis means anticipating your opponent's plans and preventing them before focusing on your own ideas. Sometimes the best move isn't advancing your plan but stopping your opponent's.",
    tips: [
      "Ask: 'What does my opponent want to do?' every move",
      "A timely preventive move can neutralize an entire plan",
      "Don't just react—anticipate and prevent",
      "Prophylaxis is thinking like a strong player thinks",
    ],
  },
  {
    title: "Converting Advantages",
    icon: TrendingUp,
    description:
      "Having an advantage and winning are different things. Converting means methodically transforming your edge (material, position, or time) into a won game through technique.",
    tips: [
      "Don't rush—methodically improve your position",
      "Trade pieces when ahead in material, not pawns",
      "Create multiple threats; don't allow counterplay",
      "Transform advantages: space → piece activity → material → win",
    ],
  },
];

const thinkingProcess = [
  {
    step: 1,
    title: "Assess the Position",
    description: "Evaluate material, king safety, piece activity, pawn structure, and space. Who stands better and why?",
  },
  {
    step: 2,
    title: "Identify Imbalances",
    description: "What are the key differences between the two positions? These imbalances guide your planning.",
  },
  {
    step: 3,
    title: "Consider Opponent's Ideas",
    description: "What does your opponent want to do? Are there threats you need to address? Practice prophylaxis.",
  },
  {
    step: 4,
    title: "Formulate a Plan",
    description: "Based on the imbalances, create a plan. What piece should improve? What weakness can you target?",
  },
  {
    step: 5,
    title: "Find Candidate Moves",
    description: "List 3-4 moves that fit your plan. Calculate each one, checking for tactics and opponent responses.",
  },
  {
    step: 6,
    title: "Execute and Reassess",
    description: "Make your move and be ready to reassess. Positions change—your plan may need to adapt.",
  },
];

export default async function StrategicThinkingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
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
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Brain className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-purple-500 text-white">
                Advanced
              </span>
              <h1 className="text-4xl font-bold mt-1">Strategic Thinking</h1>
            </div>
          </div>

          <p className="text-lg text-muted-foreground mb-4 max-w-3xl">
            Tactics win games, but strategy wins tournaments. Strategic thinking is about
            understanding the deeper aspects of chess: how to evaluate positions, create
            long-term plans, and gradually improve your position until victory becomes
            inevitable.
          </p>
          <p className="text-muted-foreground max-w-3xl mb-8">
            This guide introduces the concepts that masters use to navigate complex positions.
            Unlike tactics with clear solutions, strategy is about understanding and judgment—
            skills that develop over time with study and practice.
          </p>

          <Button asChild size="lg">
            <Link href="/learn/track/advanced-strategy">
              Start Interactive Strategy Lessons
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </section>

        {/* Position Evaluation Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">Evaluating Positions Using Imbalances</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Every position has imbalances—differences between the two sides. Identifying and
              understanding these imbalances is the foundation of strategic thinking.
            </p>

            <div className="mb-8">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Scale className="h-8 w-8 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">What Are Imbalances?</h3>
                      <p className="text-muted-foreground">
                        Imbalances are the differences between the two sides in a chess position.
                        They include material, pawn structure, piece activity, space, king safety,
                        and control of key squares. Strong players use imbalances to formulate plans:
                        they play to their strengths and attack their opponent&apos;s weaknesses.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {imbalances.map((imbalance) => (
                <Card key={imbalance.name}>
                  <CardHeader>
                    <CardTitle className="text-lg">{imbalance.name}</CardTitle>
                    <CardDescription>{imbalance.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {imbalance.considerations.map((point, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pawn Structures Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">Understanding Pawn Structures</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Pawn structure is the skeleton of the position. Each structure comes with its own
              plans, piece placements, and typical ideas.
            </p>

            <div className="space-y-6">
              {pawnStructures.map((structure) => (
                <Card key={structure.name}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <structure.icon className="h-6 w-6 text-primary" />
                      <CardTitle className="text-xl">{structure.name}</CardTitle>
                    </div>
                    <CardDescription className="text-base">
                      {structure.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-green-500/10 rounded-lg p-4">
                        <h4 className="font-semibold text-sm text-green-600 dark:text-green-400 mb-1">Playing For:</h4>
                        <p className="text-sm text-muted-foreground">{structure.playsFor}</p>
                      </div>
                      <div className="bg-red-500/10 rounded-lg p-4">
                        <h4 className="font-semibold text-sm text-red-600 dark:text-red-400 mb-1">Playing Against:</h4>
                        <p className="text-sm text-muted-foreground">{structure.playsAgainst}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Strategic Concepts Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">Key Strategic Concepts</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              These concepts form the vocabulary of strategic play
            </p>

            <div className="space-y-6">
              {strategicConcepts.map((concept) => (
                <Card key={concept.title}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <concept.icon className="h-6 w-6 text-primary" />
                      <CardTitle className="text-xl">{concept.title}</CardTitle>
                    </div>
                    <CardDescription className="text-base">
                      {concept.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid md:grid-cols-2 gap-2">
                      {concept.tips.map((tip, index) => (
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

        {/* Thinking Process Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold mb-4 text-center">A Strategic Thinking Process</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Use this framework when it&apos;s your turn to find strong moves
            </p>

            <div className="space-y-4">
              {thinkingProcess.map((step) => (
                <Card key={step.step}>
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-4">You&apos;ve Completed the Learning Path!</h2>
            <p className="text-muted-foreground mb-8">
              Congratulations on working through all four guides! Now it&apos;s time to put your
              knowledge into practice. Play games, analyze your mistakes, and revisit these
              concepts whenever you need a refresher. Chess mastery is a journey—enjoy the process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/learn/track/advanced-strategy">
                  Practice with Interactive Lessons
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/play">
                  Play a Game Now
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
            headline: "Strategic Thinking - Advanced Chess Strategy",
            description:
              "Master advanced chess strategy: position evaluation using imbalances, pawn structure plans, outposts, good vs bad bishops, prophylaxis, and converting advantages.",
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
                name: "Strategic Thinking",
                item: `${BASE_URL}/${locale}/learn/strategic-thinking`,
              },
            ],
          }),
        }}
      />
    </div>
  );
}
