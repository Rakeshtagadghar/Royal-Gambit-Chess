import { Metadata } from "next";
import Link from "next/link";
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

export const metadata: Metadata = {
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
  alternates: {
    canonical: `${BASE_URL}/chess-guides`,
  },
  openGraph: {
    title: "Chess Guides - Learn Chess Strategy & Tactics | RoyalGambit",
    description:
      "Free chess guides for beginners to advanced players. Learn chess basics, opening principles, essential endgames, and strategic thinking.",
    url: `${BASE_URL}/chess-guides`,
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

const mainGuides = [
  {
    title: "Chess Basics",
    description:
      "The perfect starting point for beginners. Learn how each piece moves, understand the rules of chess, and discover basic checkmate patterns. This comprehensive guide covers everything you need to start playing confidently.",
    level: "Beginner",
    levelColor: "bg-green-500",
    icon: Crown,
    href: "/learn/chess-basics",
    topics: [
      "How each piece moves (pawn, knight, bishop, rook, queen, king)",
      "Special moves: castling, pawn promotion, en passant",
      "Check, checkmate, and stalemate explained",
      "Basic checkmate patterns with queen and rook",
    ],
  },
  {
    title: "Opening Principles",
    description:
      "Master the fundamentals that strong players use in every game. Learn to control the center, develop your pieces efficiently, and keep your king safe. These principles will serve you in any opening.",
    level: "Intermediate",
    levelColor: "bg-blue-500",
    icon: Swords,
    href: "/learn/opening-principles",
    topics: [
      "Center control and why it matters",
      "Piece development order and coordination",
      "King safety and when to castle",
      "Common opening mistakes to avoid",
    ],
  },
  {
    title: "Essential Endgames",
    description:
      "The endgame is where games are won and lost. Learn the critical techniques that allow you to convert advantages and save difficult positions. Understanding endgames makes you a complete player.",
    level: "Intermediate",
    levelColor: "bg-blue-500",
    icon: Flag,
    href: "/learn/essential-endgames",
    topics: [
      "King activity and the concept of opposition",
      "Key squares in king and pawn endings",
      "Basic checkmates: king + queen, king + rook",
      "Rook endgame fundamentals",
    ],
  },
  {
    title: "Strategic Thinking",
    description:
      "Go beyond tactics and develop true positional understanding. Learn to evaluate positions, identify weaknesses, and create long-term plans. Strategic thinking separates good players from great ones.",
    level: "Advanced",
    levelColor: "bg-purple-500",
    icon: Brain,
    href: "/learn/strategic-thinking",
    topics: [
      "Position evaluation using imbalances",
      "Pawn structures and their plans",
      "Outposts and piece placement",
      "Prophylaxis and preventing opponent's plans",
    ],
  },
];

const quickTopics = [
  {
    title: "Piece Movement",
    description: "How each chess piece moves and captures",
    href: "/learn/chess-basics",
    icon: Crown,
  },
  {
    title: "Checkmate Patterns",
    description: "Common ways to deliver checkmate",
    href: "/learn/chess-basics",
    icon: Target,
  },
  {
    title: "Opening Strategy",
    description: "How to start a chess game properly",
    href: "/learn/opening-principles",
    icon: Swords,
  },
  {
    title: "Endgame Technique",
    description: "Converting advantages into wins",
    href: "/learn/essential-endgames",
    icon: Flag,
  },
  {
    title: "Position Evaluation",
    description: "How to assess who is better",
    href: "/learn/strategic-thinking",
    icon: Lightbulb,
  },
  {
    title: "Long-term Planning",
    description: "Creating and executing plans",
    href: "/learn/strategic-thinking",
    icon: Brain,
  },
];

export default function ChessGuidesPage() {
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
            <BookOpen className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">Chess Guides</h1>
              <p className="text-muted-foreground text-lg">
                Free tutorials to help you improve at chess
              </p>
            </div>
          </div>

          <p className="text-lg text-muted-foreground mb-4 max-w-3xl">
            Welcome to our comprehensive chess guide collection. Whether you're just learning how
            the pieces move or looking to develop advanced strategic thinking, these guides will
            help you improve your game step by step.
          </p>
          <p className="text-muted-foreground max-w-3xl">
            All guides are freely accessible—no account required to read. Each guide is designed
            to build upon the previous, but you can start wherever matches your current level.
            We recommend beginners start with Chess Basics and progress through the guides in order.
          </p>
        </section>

        {/* Main Guides Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">Learning Tracks</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Our four main guides take you from beginner to advanced player
            </p>

            <div className="space-y-6">
              {mainGuides.map((guide) => (
                <Card key={guide.title} className="overflow-hidden">
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
                        <CardTitle className="text-2xl mb-2">{guide.title}</CardTitle>
                        <CardDescription className="text-base mb-4">
                          {guide.description}
                        </CardDescription>
                        <div className="mb-4">
                          <h4 className="font-semibold text-sm mb-2">What you'll learn:</h4>
                          <ul className="grid md:grid-cols-2 gap-1">
                            {guide.topics.map((topic, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                {topic}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Button asChild>
                          <Link href={guide.href}>
                            Read Guide
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
            <h2 className="text-3xl font-bold mb-4 text-center">Quick Topics</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Jump to specific topics you want to learn about
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickTopics.map((topic) => (
                <Link key={topic.title} href={topic.href}>
                  <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-3">
                      <topic.icon className="h-8 w-8 text-primary flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold">{topic.title}</h3>
                        <p className="text-sm text-muted-foreground">{topic.description}</p>
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
                  { num: 1, title: "Chess Basics", desc: "Learn the rules and fundamentals", color: "bg-green-500" },
                  { num: 2, title: "Opening Principles", desc: "Master how to start games", color: "bg-blue-500" },
                  { num: 3, title: "Essential Endgames", desc: "Learn to convert advantages", color: "bg-blue-500" },
                  { num: 4, title: "Strategic Thinking", desc: "Develop positional mastery", color: "bg-purple-500" },
                ].map((step, index) => (
                  <div
                    key={step.num}
                    className={`flex items-center gap-4 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                  >
                    <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                      <h3 className="font-semibold text-lg">{step.title}</h3>
                      <p className="text-muted-foreground text-sm">{step.desc}</p>
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
            <h2 className="text-3xl font-bold mb-4">Want Interactive Lessons?</h2>
            <p className="text-muted-foreground mb-8">
              Beyond these guides, RoyalGambit offers interactive lessons where you practice
              on a real chessboard with immediate feedback. Create a free account to access
              step-by-step lessons, track your progress, and earn achievements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/learn">
                  Access Interactive Lessons
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/how-it-works">Learn How It Works</Link>
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
                item: `${BASE_URL}/chess-guides`,
              },
            ],
          }),
        }}
      />
    </div>
  );
}
