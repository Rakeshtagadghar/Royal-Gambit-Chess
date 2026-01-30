import { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen,
  Target,
  ChevronRight,
  GraduationCap,
  Crown,
  Swords,
  Flag,
  Brain,
  Puzzle,
  Award,
  Flame,
} from 'lucide-react';
import { BASE_URL } from '@/lib/config';
import { LearnCTA } from '@/components/learn/LearnCTA';

export const metadata: Metadata = {
  title: 'Learn Chess - Interactive Lessons & Tutorials | RoyalGambit',
  description:
    'Learn chess with interactive lessons, from beginner basics to advanced strategy. Free chess tutorials covering openings, endgames, tactics, and more. Track your progress.',
  keywords: [
    'learn chess',
    'chess lessons',
    'chess tutorials',
    'chess for beginners',
    'interactive chess',
    'chess course',
    'improve at chess',
  ],
  alternates: {
    canonical: `${BASE_URL}/learn`,
  },
  openGraph: {
    title: 'Learn Chess - Interactive Lessons & Tutorials | RoyalGambit',
    description:
      'Learn chess with interactive lessons, from beginner basics to advanced strategy. Free chess tutorials covering openings, endgames, tactics, and more.',
    url: `${BASE_URL}/learn`,
    siteName: 'RoyalGambit',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Learn Chess - Interactive Lessons & Tutorials | RoyalGambit',
    description:
      'Learn chess with interactive lessons, from beginner basics to advanced strategy. Free tutorials and progress tracking.',
  },
};

const learningTracks = [
  {
    title: 'Chess Basics',
    level: 'Beginner',
    levelColor: 'bg-green-500',
    icon: Crown,
    description: 'Learn how each piece moves, special rules, and basic checkmate patterns.',
    href: '/learn/chess-basics',
    trackHref: '/learn/track/beginner-basics',
    topics: ['Piece movement', 'Castling & en passant', 'Check & checkmate', 'Basic mates'],
  },
  {
    title: 'Opening Principles',
    level: 'Intermediate',
    levelColor: 'bg-blue-500',
    icon: Swords,
    description: 'Master center control, piece development, and king safety fundamentals.',
    href: '/learn/opening-principles',
    trackHref: '/learn/track/intermediate-openings',
    topics: ['Center control', 'Development', 'King safety', 'Common mistakes'],
  },
  {
    title: 'Essential Endgames',
    level: 'Intermediate',
    levelColor: 'bg-blue-500',
    icon: Flag,
    description: 'Learn critical endgame techniques to convert advantages into wins.',
    href: '/learn/essential-endgames',
    trackHref: '/learn/track/intermediate-endgames',
    topics: ['King activity', 'Opposition', 'Basic mates', 'Rook endgames'],
  },
  {
    title: 'Strategic Thinking',
    level: 'Advanced',
    levelColor: 'bg-purple-500',
    icon: Brain,
    description: 'Develop positional understanding, planning skills, and prophylaxis.',
    href: '/learn/strategic-thinking',
    trackHref: '/learn/track/advanced-strategy',
    topics: ['Imbalances', 'Pawn structures', 'Outposts', 'Converting advantages'],
  },
];

const features = [
  {
    icon: BookOpen,
    title: 'Interactive Lessons',
    description: 'Practice directly on the chessboard with step-by-step guided instruction.',
  },
  {
    icon: Puzzle,
    title: 'Tactical Puzzles',
    description: 'Sharpen your skills with themed puzzle packs targeting specific patterns.',
  },
  {
    icon: Award,
    title: 'Achievements & Progress',
    description: 'Track your improvement with detailed stats, badges, and learning streaks.',
  },
  {
    icon: Flame,
    title: 'Learning Streaks',
    description: 'Stay motivated by maintaining daily learning streaks and building consistency.',
  },
];

const faqs = [
  {
    question: 'Do I need an account to read the guides?',
    answer:
      'No! All our chess guides (Chess Basics, Opening Principles, Essential Endgames, Strategic Thinking) are freely accessible without an account. You only need to sign in to access interactive lessons and track your progress.',
  },
  {
    question: 'What level are the lessons designed for?',
    answer:
      'We have content for all levels. Beginners can start with Chess Basics to learn the rules. Intermediate players can improve openings and endgames. Advanced players can develop strategic thinking.',
  },
  {
    question: 'How do interactive lessons work?',
    answer:
      'Each interactive lesson guides you through concepts step-by-step. You make moves on a real chessboard, get immediate feedback, and can\'t proceed until you find the correct move. This ensures you truly understand each concept.',
  },
  {
    question: 'Is the learning content really free?',
    answer:
      'Yes! All guides and lessons are free. Create an account to unlock progress tracking, achievements, and learning streaks at no cost.',
  },
  {
    question: 'How long does it take to complete a track?',
    answer:
      'Each track contains multiple lessons and takes several hours to complete thoroughly. But you can learn at your own pace—there\'s no time limit, and you can revisit any lesson.',
  },
  {
    question: 'Can I skip ahead to advanced content?',
    answer:
      'Absolutely. While we recommend following the learning path in order, you\'re free to start with any guide or track that matches your current level.',
  },
];

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">Learn Chess</h1>
              <p className="text-muted-foreground text-lg">
                Interactive lessons and guides for every skill level
              </p>
            </div>
          </div>

          <p className="text-lg text-muted-foreground mb-4 max-w-3xl">
            Whether you're picking up chess for the first time or looking to sharpen your skills,
            RoyalGambit offers structured learning tracks that take you from beginner to advanced
            player. Our interactive lessons let you practice on a real chessboard with immediate
            feedback.
          </p>
          <p className="text-muted-foreground max-w-3xl mb-8">
            Start with our free guides below, or sign in to access interactive lessons,
            track your progress, and earn achievements as you improve.
          </p>

          <LearnCTA variant="hero" />
        </section>

        {/* Learning Tracks Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">Learning Tracks</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Follow our structured learning path from beginner to advanced, or jump to the
              track that matches your level
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {learningTracks.map((track) => (
                <Card key={track.title} className="overflow-hidden">
                  <div className={`h-1 ${track.levelColor}`} />
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <track.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${track.levelColor} text-white`}>
                            {track.level}
                          </span>
                        </div>
                        <CardTitle className="text-xl">{track.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {track.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {track.topics.map((topic) => (
                        <span key={topic} className="text-xs bg-muted px-2 py-1 rounded-md">
                          {topic}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button asChild size="sm">
                        <Link href={track.href}>Read Guide</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href={track.trackHref}>
                          Interactive Lessons
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">Why Learn with RoyalGambit?</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Our platform is designed to make learning chess effective and enjoyable
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <Card key={feature.title} className="text-center">
                  <CardContent className="pt-6">
                    <feature.icon className="h-10 w-10 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold mb-4 text-center">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-center mb-12">
              Common questions about our learning platform
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
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl font-bold mb-4">Ready to Improve Your Chess?</h2>
            <p className="text-muted-foreground mb-8">
              Start with our free Chess Basics guide, or create an account to access
              interactive lessons, puzzles, and track your progress over time.
            </p>
            <LearnCTA variant="bottom" />
          </div>
        </section>
      </main>

      <Footer />

      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          }),
        }}
      />

      {/* Breadcrumb Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: BASE_URL,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Learn',
                item: `${BASE_URL}/learn`,
              },
            ],
          }),
        }}
      />
    </div>
  );
}
