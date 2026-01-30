import { Metadata } from "next";
import Link from "next/link";
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
import { BASE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "How It Works - Learn Chess Online | RoyalGambit",
  description:
    "Discover how RoyalGambit helps you learn chess through interactive lessons, practice puzzles, and play against AI or real opponents. Start your chess journey today.",
  keywords: [
    "how to learn chess",
    "interactive chess lessons",
    "practice chess puzzles",
    "play vs computer",
    "chess learning platform",
    "online chess tutorial",
  ],
  alternates: {
    canonical: `${BASE_URL}/how-it-works`,
  },
  openGraph: {
    title: "How It Works - Learn Chess Online | RoyalGambit",
    description:
      "Discover how RoyalGambit helps you learn chess through interactive lessons, practice puzzles, and play against AI or real opponents.",
    url: `${BASE_URL}/how-it-works`,
    siteName: "RoyalGambit",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "How It Works - Learn Chess Online | RoyalGambit",
    description:
      "Discover how RoyalGambit helps you learn chess through interactive lessons, practice puzzles, and play against AI or real opponents.",
  },
};

const learningSteps = [
  {
    step: 1,
    title: "Choose Your Learning Path",
    description:
      "Start with structured learning tracks designed for your skill level. Whether you're a complete beginner learning how pieces move or an intermediate player refining your strategy, we have a path for you.",
    icon: BookOpen,
    color: "text-green-500",
  },
  {
    step: 2,
    title: "Interactive Lessons",
    description:
      "Each lesson guides you through concepts with clear explanations and hands-on practice on a real chessboard. Make moves, see immediate feedback, and understand why certain moves work.",
    icon: GraduationCap,
    color: "text-blue-500",
  },
  {
    step: 3,
    title: "Practice with Puzzles",
    description:
      "Reinforce what you've learned with tactical puzzles. Our curated puzzle packs focus on specific themes like forks, pins, and checkmate patterns so you can sharpen your tactical vision.",
    icon: Puzzle,
    color: "text-purple-500",
  },
  {
    step: 4,
    title: "Play and Apply",
    description:
      "Put your skills to the test by playing games. Challenge our AI at various difficulty levels, play with friends, or find opponents through matchmaking. Real games help cement your learning.",
    icon: Play,
    color: "text-orange-500",
  },
  {
    step: 5,
    title: "Track Your Progress",
    description:
      "Monitor your improvement with detailed progress tracking. See your lesson completion, puzzle accuracy, and rating changes over time. Celebrate achievements and maintain learning streaks.",
    icon: TrendingUp,
    color: "text-primary",
  },
];

const features = [
  {
    title: "Beginner-Friendly Basics",
    description:
      "Learn piece movements, special rules like castling and en passant, and basic checkmate patterns. Perfect for those just starting their chess journey.",
    icon: CheckCircle,
    href: "/learn/chess-basics",
  },
  {
    title: "Opening Principles",
    description:
      "Master the fundamentals of chess openings: control the center, develop your pieces, and keep your king safe. Build a solid foundation for every game.",
    icon: Target,
    href: "/learn/opening-principles",
  },
  {
    title: "Essential Endgames",
    description:
      "Learn critical endgame techniques including king and pawn endings, basic mates, and rook endgames. Knowing how to convert advantages into wins.",
    icon: Award,
    href: "/learn/essential-endgames",
  },
  {
    title: "Strategic Thinking",
    description:
      "Develop positional understanding, learn to evaluate positions, identify weaknesses, and create long-term plans. Think like a chess player.",
    icon: Lightbulb,
    href: "/learn/strategic-thinking",
  },
];

const playModes = [
  {
    title: "Play vs AI",
    description:
      "Practice against Stockfish, one of the strongest chess engines in the world, with adjustable difficulty from beginner to expert. Perfect for learning without time pressure.",
    icon: Bot,
  },
  {
    title: "Play with Friends",
    description:
      "Create a game and share a link with friends. Play real-time games with low latency and see each other's moves instantly. Great for casual games or remote chess sessions.",
    icon: Users,
  },
  {
    title: "Matchmaking",
    description:
      "Find opponents automatically based on rating and preferred time controls. Play bullet, blitz, rapid, or classical games against players at your level.",
    icon: TrendingUp,
  },
];

const faqs = [
  {
    question: "Do I need to create an account to learn?",
    answer:
      "No! All our educational guides and chess tutorials are publicly accessible. You can read our chess basics, opening principles, and strategy guides without signing up. An account is only needed to track your progress, maintain streaks, and play online games.",
  },
  {
    question: "Is RoyalGambit suitable for complete beginners?",
    answer:
      "Absolutely. Our Chess Basics track starts from the very beginning, teaching you how each piece moves, the rules of the game, and fundamental concepts. We designed our lessons to be approachable for anyone who wants to learn chess.",
  },
  {
    question: "How are the lessons structured?",
    answer:
      "Each learning track contains multiple lessons organized by topic. Lessons include clear explanations, diagrams, and interactive exercises where you practice on a real chessboard. You progress at your own pace and can revisit any lesson.",
  },
  {
    question: "What makes the puzzles helpful?",
    answer:
      "Our puzzles are curated by theme, so you can practice specific tactics like pins, forks, or discovered attacks. This focused practice builds pattern recognition faster than random puzzles, helping you spot opportunities in real games.",
  },
  {
    question: "Can I play without a time limit?",
    answer:
      "Yes. When playing against our AI, you can take as much time as you need to think through your moves. For online play, we offer various time controls including longer classical games where you have plenty of time to consider each move.",
  },
  {
    question: "Is the platform free?",
    answer:
      "Yes, the core features are free to use. You can access all learning content, play against the AI, and play with friends without any payment required.",
  },
];

export default function HowItWorksPage() {
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
            Back to home
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">How It Works</h1>
              <p className="text-muted-foreground text-lg">
                Your complete guide to learning chess on RoyalGambit
              </p>
            </div>
          </div>

          <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
            RoyalGambit is designed to take you from complete beginner to confident player
            through structured lessons, tactical puzzles, and real game practice. Whether
            you want to learn the basics or improve your strategic thinking, our platform
            provides the tools and guidance you need.
          </p>
        </section>

        {/* Learning Steps Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">Your Learning Journey</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Follow these steps to improve your chess skills systematically
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
                            Step {step.step}
                          </span>
                          <h3 className="text-xl font-semibold">{step.title}</h3>
                        </div>
                        <p className="text-muted-foreground">{step.description}</p>
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
            <h2 className="text-3xl font-bold mb-4 text-center">What You Can Learn</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Explore our comprehensive learning tracks covering all aspects of chess
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature) => (
                <Link key={feature.title} href={feature.href}>
                  <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <feature.icon className="h-8 w-8 text-primary" />
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </div>
                      <CardDescription className="text-sm mt-2">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button asChild size="lg">
                <Link href="/chess-guides">
                  Explore All Guides
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Play Modes Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">Ways to Play</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Practice what you learn by playing games in various formats
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {playModes.map((mode) => (
                <Card key={mode.title} className="h-full">
                  <CardHeader className="text-center">
                    <mode.icon className="h-12 w-12 mx-auto mb-2 text-primary" />
                    <CardTitle>{mode.title}</CardTitle>
                    <CardDescription>{mode.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button asChild size="lg" variant="outline">
                <Link href="/play">
                  Start Playing
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold mb-4 text-center">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-center mb-12">
              Common questions about learning chess on RoyalGambit
            </p>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
            <p className="text-muted-foreground mb-8">
              Begin with our Chess Basics guide and work your way through the learning tracks.
              No account required to read our guides—jump right in!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/learn/chess-basics">
                  Start with Chess Basics
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/chess-guides">Browse All Guides</Link>
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
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />
    </div>
  );
}
