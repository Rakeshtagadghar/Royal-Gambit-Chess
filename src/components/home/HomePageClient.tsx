'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import {
  Bot,
  Users,
  Trophy,
  Zap,
  Shield,
  Clock,
  ChevronRight,
  GraduationCap,
  Award,
  Puzzle,
  Crown,
  Swords,
  Flag,
  Brain,
  BookOpen,
  Target,
  CheckCircle,
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

const playFeatures = [
  {
    icon: Bot,
    title: 'Play vs Bot',
    description: 'Challenge Stockfish with 5 difficulty levels, from beginner to expert.',
  },
  {
    icon: Users,
    title: 'Play vs Friends',
    description: 'Create a game and share the link. Real-time moves with low latency.',
  },
  {
    icon: Trophy,
    title: 'Matchmaking',
    description: 'Find opponents automatically. Queue by time control preference.',
  },
];

const learnFeatures = [
  {
    icon: GraduationCap,
    title: 'Interactive Lessons',
    description: 'Step-by-step lessons from basics to advanced strategy with guided practice.',
  },
  {
    icon: Puzzle,
    title: 'Practice Puzzles',
    description: 'Sharpen your tactics with curated puzzle packs. Track your accuracy.',
  },
  {
    icon: Award,
    title: 'Achievements',
    description: 'Earn badges as you progress. Track streaks and unlock rewards.',
  },
];

const platformFeatures = [
  {
    icon: Clock,
    title: 'Time Controls',
    description: 'Bullet, Blitz, Rapid, and Classical. All with optional increment.',
  },
  {
    icon: Shield,
    title: 'Secure & Fair',
    description: 'Server-validated moves. No client-side cheating possible.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized for speed. Smooth animations and instant feedback.',
  },
];

const learningTracks = [
  {
    level: 'Beginner',
    title: 'Chess Basics',
    description: 'Learn piece movement, rules, and fundamental concepts',
    color: 'from-green-500 to-emerald-600',
  },
  {
    level: 'Intermediate',
    title: 'Tactics & Patterns',
    description: 'Master forks, pins, skewers, and common tactical motifs',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    level: 'Advanced',
    title: 'Strategy & Planning',
    description: 'Develop positional understanding and long-term planning',
    color: 'from-purple-500 to-violet-600',
  },
  {
    level: 'Expert',
    title: 'Master Techniques',
    description: 'Advanced endgames, complex calculations, and deep analysis',
    color: 'from-orange-500 to-red-600',
  },
];

const sampleAchievements = [
  { icon: '🎯', title: 'First Steps', description: 'Complete your first lesson' },
  { icon: '🔥', title: 'On Fire', description: 'Maintain a 7-day streak' },
  { icon: '🧩', title: 'Puzzle Master', description: 'Solve 100 puzzles' },
  { icon: '👑', title: 'Track Champion', description: 'Complete an entire track' },
];

const chessGuides = [
  {
    title: 'Chess Basics',
    description: 'Learn how each piece moves, special rules like castling, and basic checkmate patterns.',
    href: '/learn/chess-basics',
    icon: Crown,
    level: 'Beginner',
    levelColor: 'bg-green-500',
  },
  {
    title: 'Opening Principles',
    description: 'Master center control, piece development, and king safety to start every game strong.',
    href: '/learn/opening-principles',
    icon: Swords,
    level: 'Intermediate',
    levelColor: 'bg-blue-500',
  },
  {
    title: 'Essential Endgames',
    description: 'Learn critical endgame techniques to convert advantages into wins.',
    href: '/learn/essential-endgames',
    icon: Flag,
    level: 'Intermediate',
    levelColor: 'bg-blue-500',
  },
  {
    title: 'Strategic Thinking',
    description: 'Develop positional understanding, planning skills, and prophylactic thinking.',
    href: '/learn/strategic-thinking',
    icon: Brain,
    level: 'Advanced',
    levelColor: 'bg-purple-500',
  },
];

const homeFaqs = [
  {
    question: 'Is Royal Gambit Chess free to use?',
    answer: 'Yes, the learning content and play features are available to get started without payment. All our chess guides are freely accessible, and you can play against our AI without an account.',
  },
  {
    question: 'Do I need an account to read the guides?',
    answer: 'No. All guide pages are public and accessible without signing in. An account is only needed to track your learning progress, maintain streaks, and play rated games against other players.',
  },
  {
    question: 'What level is this for?',
    answer: 'Royal Gambit serves players from complete beginner to advanced. Our structured learning tracks start with the very basics and progress through opening principles, endgame technique, and strategic thinking.',
  },
];

const whyRoyalGambit = [
  {
    icon: BookOpen,
    title: 'Comprehensive Learning',
    description: 'Structured learning tracks take you from beginner to advanced with interactive lessons and clear explanations.',
  },
  {
    icon: Target,
    title: 'Focused Practice',
    description: 'Themed puzzle packs let you practice specific tactics like pins, forks, and checkmate patterns.',
  },
  {
    icon: Bot,
    title: 'Adjustable AI',
    description: 'Play against Stockfish at 5 difficulty levels—from beginner-friendly to grandmaster strength.',
  },
  {
    icon: Shield,
    title: 'Fair Play',
    description: 'All moves are server-validated. No client-side cheating is possible, ensuring fair games.',
  },
];

export function HomePageClient() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(30deg, var(--board-dark) 12%, transparent 12.5%, transparent 87%, var(--board-dark) 87.5%, var(--board-dark)),
              linear-gradient(150deg, var(--board-dark) 12%, transparent 12.5%, transparent 87%, var(--board-dark) 87.5%, var(--board-dark)),
              linear-gradient(30deg, var(--board-dark) 12%, transparent 12.5%, transparent 87%, var(--board-dark) 87.5%, var(--board-dark)),
              linear-gradient(150deg, var(--board-dark) 12%, transparent 12.5%, transparent 87%, var(--board-dark) 87.5%, var(--board-dark)),
              linear-gradient(60deg, var(--board-light) 25%, transparent 25.5%, transparent 75%, var(--board-light) 75%, var(--board-light)),
              linear-gradient(60deg, var(--board-light) 25%, transparent 25.5%, transparent 75%, var(--board-light) 75%, var(--board-light))
            `,
            backgroundSize: '80px 140px',
            backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px'
          }} />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                RoyalGambit
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8">
                Play, Learn, and Master Chess.
                <br />
                Interactive lessons, tactical puzzles, and competitive play.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/play">
                  Play Now
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link href="/login">
                  Sign In
                </Link>
              </Button>
            </motion.div>

            {/* Animated chess pieces */}
            <motion.div
              className="mt-16 flex justify-center gap-4 text-6xl md:text-8xl opacity-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              {['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'].map((piece, i) => (
                <motion.span
                  key={i}
                  initial={{ y: 20 }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                >
                  {piece}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Play
            </h2>
            <p className="text-muted-foreground text-lg">
              A complete chess experience, completely free.
            </p>
          </motion.div>

          {/* Play Features */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-center text-muted-foreground">Play</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {playFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <feature.icon className="h-10 w-10 text-primary mb-2" />
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Learn Features */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-center text-muted-foreground">Learn & Improve</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {learnFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:border-accent/50 transition-colors border-accent/20">
                    <CardHeader>
                      <feature.icon className="h-10 w-10 text-accent mb-2" />
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Platform Features */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-center text-muted-foreground">Platform</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {platformFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <feature.icon className="h-10 w-10 text-muted-foreground mb-2" />
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Learning Tracks Preview Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Structured Learning Paths
            </h2>
            <p className="text-muted-foreground text-lg">
              From beginner to expert, progress at your own pace.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {learningTracks.map((track, index) => (
              <motion.div
                key={track.level}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${track.color}`} />
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-gradient-to-r ${track.color} text-white`}>
                        {track.level}
                      </span>
                    </div>
                    <CardTitle className="text-lg">{track.title}</CardTitle>
                    <CardDescription>{track.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Preview Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Earn Achievements
            </h2>
            <p className="text-muted-foreground text-lg">
              Track your progress and unlock badges as you improve.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {sampleAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full text-center hover:border-accent/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="text-4xl mb-3">{achievement.icon}</div>
                    <h3 className="font-semibold text-sm mb-1">{achievement.title}</h3>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Learn Chess Online Section - SEO Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Learn Chess Online — Step by Step
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              RoyalGambit provides a structured path to chess improvement. Whether you&apos;re learning
              how the pieces move or refining your strategic thinking, our free guides and interactive
              lessons will help you grow as a player.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Beginner-Friendly Chess Basics</h3>
                  <p className="text-muted-foreground text-sm">
                    Start from zero with our comprehensive guide to piece movement, special rules,
                    and fundamental checkmate patterns.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Interactive Lessons and Practice</h3>
                  <p className="text-muted-foreground text-sm">
                    Learn by doing with our interactive lessons where you make moves on a real
                    chessboard and get immediate feedback.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Openings, Endgames, and Strategy Tracks</h3>
                  <p className="text-muted-foreground text-sm">
                    Progress through structured learning tracks covering opening principles,
                    essential endgames, and advanced strategic concepts.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Play vs AI or Friends</h3>
                  <p className="text-muted-foreground text-sm">
                    Apply what you learn by playing games against our adjustable-strength AI
                    or challenge friends to real-time matches.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button asChild size="lg" variant="outline">
              <Link href="/how-it-works">
                Learn How It Works
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* What You Can Learn Section - Links to Guide Pages */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What You Can Learn
            </h2>
            <p className="text-muted-foreground text-lg">
              Free chess guides for every level — no account required
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {chessGuides.map((guide, index) => (
              <motion.div
                key={guide.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={guide.href}>
                  <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <guide.icon className="h-8 w-8 text-primary" />
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${guide.levelColor} text-white`}>
                          {guide.level}
                        </span>
                      </div>
                      <CardTitle className="text-lg">{guide.title}</CardTitle>
                      <CardDescription>{guide.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button asChild size="lg">
              <Link href="/chess-guides">
                Browse All Guides
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Royal Gambit Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Royal Gambit?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A modern chess platform designed for learning and playing
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyRoyalGambit.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full text-center">
                  <CardContent className="pt-6">
                    <feature.icon className="h-10 w-10 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {homeFaqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="py-12">
                <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
                <p className="text-muted-foreground mb-6">
                  Create a free account to play against bots, challenge friends, access interactive lessons, and track your progress.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg">
                    <Link href="/login">
                      <ChevronRight className="mr-2 h-5 w-5" />
                      Get Started Free
                    </Link>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Sign up with email or Google. No credit card required.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
