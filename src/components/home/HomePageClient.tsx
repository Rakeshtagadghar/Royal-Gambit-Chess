'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
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
  Sparkles,
  Play,
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { useRef } from 'react';

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
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
  },
  {
    level: 'Intermediate',
    title: 'Tactics & Patterns',
    description: 'Master forks, pins, skewers, and common tactical motifs',
    color: 'from-sky-500 to-blue-500',
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-700',
  },
  {
    level: 'Advanced',
    title: 'Strategy & Planning',
    description: 'Develop positional understanding and long-term planning',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
  },
  {
    level: 'Expert',
    title: 'Master Techniques',
    description: 'Advanced endgames, complex calculations, and deep analysis',
    color: 'from-rose-500 to-red-500',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700',
  },
];

const sampleAchievements = [
  { icon: Target, title: 'First Steps', description: 'Complete your first lesson', color: 'text-emerald-500' },
  { icon: Zap, title: 'On Fire', description: 'Maintain a 7-day streak', color: 'text-orange-500' },
  { icon: Puzzle, title: 'Puzzle Master', description: 'Solve 100 puzzles', color: 'text-sky-500' },
  { icon: Crown, title: 'Track Champion', description: 'Complete an entire track', color: 'text-amber-500' },
];

const chessGuides = [
  {
    title: 'Chess Basics',
    description: 'Learn how each piece moves, special rules like castling, and basic checkmate patterns.',
    href: '/learn/chess-basics',
    icon: Crown,
    level: 'Beginner',
    levelColor: 'bg-emerald-500',
  },
  {
    title: 'Opening Principles',
    description: 'Master center control, piece development, and king safety to start every game strong.',
    href: '/learn/opening-principles',
    icon: Swords,
    level: 'Intermediate',
    levelColor: 'bg-sky-500',
  },
  {
    title: 'Essential Endgames',
    description: 'Learn critical endgame techniques to convert advantages into wins.',
    href: '/learn/essential-endgames',
    icon: Flag,
    level: 'Intermediate',
    levelColor: 'bg-sky-500',
  },
  {
    title: 'Strategic Thinking',
    description: 'Develop positional understanding, planning skills, and prophylactic thinking.',
    href: '/learn/strategic-thinking',
    icon: Brain,
    level: 'Advanced',
    levelColor: 'bg-amber-500',
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

// Staggered animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 40,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 1,
    },
  },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Chess piece SVG component for decorative use
function ChessPiece({ type, className }: { type: 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn', className?: string }) {
  const pieces = {
    king: 'M12 3l-1.5 3h-3l3 3-1.5 3h6l-1.5-3 3-3h-3L12 3zm-4 12h8v2H8v-2zm-2 4h12v2H6v-2z',
    queen: 'M12 2l2 4 4-2-2 4 4 2-4 2 2 4-4-2-2 4-2-4-4 2 2-4-4-2 4-2-2-4 4 2 2-4zM6 18h12v2H6v-2z',
    rook: 'M6 4h2v2h2V4h4v2h2V4h2v6h-2v8h2v2H6v-2h2v-8H6V4zm4 6v8h4v-8h-4z',
    bishop: 'M12 2c-1.1 0-2 .9-2 2 0 .7.4 1.4 1 1.7V8L8 12v2l4-2 4 2v-2l-3-4V5.7c.6-.3 1-1 1-1.7 0-1.1-.9-2-2-2zM6 18h12v2H6v-2z',
    knight: 'M19 22H5v-2h14v2zM13 2c-1.25 0-2.42.62-3.11 1.66L7 8l2 2-2.5 2.5L9 15l3-3 1 1c.33.33.67.67 1.09.91.12.07.24.13.37.19.12.05.25.1.38.13.13.03.26.05.39.06.07.01.13.01.2.01h.07c1.38 0 2.5-1.12 2.5-2.5V5c0-1.66-1.34-3-3-3z',
    pawn: 'M12 4c-1.66 0-3 1.34-3 3 0 1.3.84 2.4 2 2.82V12H9v2h2v4H6v2h12v-2h-5v-4h2v-2h-2V9.82c1.16-.42 2-1.52 2-2.82 0-1.66-1.34-3-3-3z',
  };
  
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d={pieces[type]} />
    </svg>
  );
}

// Floating chess pieces decoration component
function FloatingPieces() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* King - top left */}
      <motion.div
        className="absolute top-[15%] left-[8%] text-foreground/[0.04]"
        animate={{ 
          y: [0, -15, 0],
          rotate: [0, 5, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChessPiece type="king" className="w-24 h-24 md:w-32 md:h-32" />
      </motion.div>
      
      {/* Queen - top right */}
      <motion.div
        className="absolute top-[20%] right-[10%] text-foreground/[0.03]"
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -8, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <ChessPiece type="queen" className="w-20 h-20 md:w-28 md:h-28" />
      </motion.div>
      
      {/* Knight - middle left */}
      <motion.div
        className="absolute top-[45%] left-[5%] text-foreground/[0.04]"
        animate={{ 
          y: [0, 12, 0],
          x: [0, 8, 0],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <ChessPiece type="knight" className="w-16 h-16 md:w-24 md:h-24" />
      </motion.div>
      
      {/* Rook - middle right */}
      <motion.div
        className="absolute top-[50%] right-[6%] text-foreground/[0.03]"
        animate={{ 
          y: [0, -18, 0],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <ChessPiece type="rook" className="w-14 h-14 md:w-20 md:h-20" />
      </motion.div>
      
      {/* Bishop - bottom left */}
      <motion.div
        className="absolute bottom-[25%] left-[12%] text-foreground/[0.03]"
        animate={{ 
          y: [0, 15, 0],
          rotate: [0, -5, 0],
        }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      >
        <ChessPiece type="bishop" className="w-16 h-16 md:w-22 md:h-22" />
      </motion.div>
      
      {/* Pawn - bottom right */}
      <motion.div
        className="absolute bottom-[30%] right-[15%] text-foreground/[0.04]"
        animate={{ 
          y: [0, -10, 0],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      >
        <ChessPiece type="pawn" className="w-12 h-12 md:w-16 md:h-16" />
      </motion.div>
    </div>
  );
}

// Chess board pattern component
function ChessBoardPattern({ className }: { className?: string }) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="chess-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="30" height="30" fill="currentColor" opacity="0.03" />
            <rect x="30" y="30" width="30" height="30" fill="currentColor" opacity="0.03" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#chess-pattern)" />
      </svg>
    </div>
  );
}

export function HomePageClient() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 50]);
  const imageParallax = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section ref={heroRef} className="relative flex-1 flex items-center justify-center overflow-hidden min-h-[100vh]">
        {/* Background Image Layer */}
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ y: imageParallax }}
        >
          <Image
            src="/images/chess-hero.jpg"
            alt=""
            fill
            className="object-cover opacity-[0.08]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        </motion.div>

        {/* Chess board pattern overlay */}
        <ChessBoardPattern className="opacity-50" />

        {/* Floating chess pieces */}
        <FloatingPieces />

        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-20 left-10 w-72 h-72 bg-primary/8 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-20 right-10 w-96 h-96 bg-accent/8 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.6, 0.4, 0.6],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl" />
        </div>

        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="container mx-auto px-4 py-20 relative z-10"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20 backdrop-blur-sm"
              >
                <Sparkles className="w-4 h-4" />
                Free to play and learn
              </motion.div>
              
              {/* Elegant crown icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
                className="flex justify-center mb-6"
              >
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/10 shadow-xl shadow-primary/10">
                  <Crown className="w-10 h-10 text-primary" />
                </div>
              </motion.div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight">
                <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text">Royal</span>
                <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">Gambit</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed text-balance">
                Play, Learn, and Master Chess.
                Interactive lessons, tactical puzzles, and competitive play.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button asChild size="lg" className="text-lg px-8 h-14 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all duration-300 group">
                <Link href="/play">
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Play Now
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 h-14 rounded-xl border-2 hover:bg-secondary backdrop-blur-sm transition-all duration-300">
                <Link href="/login">
                  Sign In
                </Link>
              </Button>
            </motion.div>

            {/* Animated chess pieces row */}
            <motion.div
              className="mt-20 flex justify-center gap-3 md:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              {['king', 'queen', 'bishop', 'knight', 'rook', 'pawn', 'pawn', 'rook'].map((piece, i) => (
                <motion.div
                  key={i}
                  className="text-foreground/10 hover:text-primary/40 transition-colors duration-300 cursor-default"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.7 + i * 0.08,
                    ease: "easeOut",
                  }}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.15,
                    transition: { duration: 0.2 }
                  }}
                >
                  <ChessPiece type={piece as 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn'} className="w-10 h-10 md:w-14 md:h-14" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
          >
            <motion.div className="w-1.5 h-2.5 bg-muted-foreground/50 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Visual Showcase Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Subtle chess pattern background */}
        <div className="absolute inset-0 opacity-30">
          <Image
            src="/images/chess-pattern.jpg"
            alt=""
            fill
            className="object-cover opacity-10"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariants}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
              The Art of Chess
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience chess like never before with stunning visuals and intuitive gameplay.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
          >
            <motion.div variants={cardVariants} className="relative group">
              <div className="relative h-80 rounded-3xl overflow-hidden shadow-2xl shadow-black/10">
                <Image
                  src="/images/chess-king.jpg"
                  alt="Elegant chess king piece"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">Master the Game</h3>
                  <p className="text-white/80 text-sm">Learn strategies from the masters</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={cardVariants} className="relative group">
              <div className="relative h-80 rounded-3xl overflow-hidden shadow-2xl shadow-black/10">
                <Image
                  src="/images/chess-atmosphere.jpg"
                  alt="Chess game atmosphere"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">Immersive Experience</h3>
                  <p className="text-white/80 text-sm">Beautiful, thoughtful design at every move</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-secondary/50 relative">
        <ChessBoardPattern className="opacity-30" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariants}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
              Everything You Need to Play
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A complete chess experience, completely free.
            </p>
          </motion.div>

          {/* Play Features */}
          <div className="mb-16">
            <motion.h3 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm font-semibold mb-6 text-center text-primary uppercase tracking-wider"
            >
              Play
            </motion.h3>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={containerVariants}
            >
              {playFeatures.map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={cardVariants}
                >
                  <Card className="h-full border-0 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 bg-card/80 backdrop-blur-sm group hover:-translate-y-1">
                    <CardHeader className="space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                        <feature.icon className="h-7 w-7 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription className="text-base">{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Learn Features */}
          <div className="mb-16">
            <motion.h3 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm font-semibold mb-6 text-center text-accent uppercase tracking-wider"
            >
              Learn & Improve
            </motion.h3>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={containerVariants}
            >
              {learnFeatures.map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={cardVariants}
                >
                  <Card className="h-full border-0 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-accent/10 transition-all duration-500 bg-card/80 backdrop-blur-sm group hover:-translate-y-1">
                    <CardHeader className="space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                        <feature.icon className="h-7 w-7 text-accent" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription className="text-base">{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Platform Features */}
          <div>
            <motion.h3 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm font-semibold mb-6 text-center text-muted-foreground uppercase tracking-wider"
            >
              Platform
            </motion.h3>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={containerVariants}
            >
              {platformFeatures.map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={cardVariants}
                >
                  <Card className="h-full border-0 shadow-lg shadow-black/5 hover:shadow-xl transition-all duration-500 bg-card/80 backdrop-blur-sm group hover:-translate-y-1">
                    <CardHeader className="space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-muted/80 group-hover:scale-110 transition-all duration-300">
                        <feature.icon className="h-7 w-7 text-muted-foreground" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription className="text-base">{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Learning Tracks Preview Section */}
      <section className="py-24 relative">
        <FloatingPieces />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariants}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
              Structured Learning Paths
            </h2>
            <p className="text-muted-foreground text-lg">
              From beginner to expert, progress at your own pace.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
          >
            {learningTracks.map((track) => (
              <motion.div
                key={track.level}
                variants={cardVariants}
              >
                <Card className="h-full overflow-hidden border-0 shadow-lg shadow-black/5 hover:shadow-xl transition-all duration-500 group hover:-translate-y-2">
                  <div className={`h-1.5 bg-gradient-to-r ${track.color}`} />
                  <CardHeader className="pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full bg-gradient-to-r ${track.color} text-white shadow-sm`}>
                        {track.level}
                      </span>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">{track.title}</CardTitle>
                    <CardDescription className="text-sm">{track.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Achievements Preview Section */}
      <section className="py-24 bg-secondary/50 relative">
        <ChessBoardPattern className="opacity-20" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariants}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
              Earn Achievements
            </h2>
            <p className="text-muted-foreground text-lg">
              Track your progress and unlock badges as you improve.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
          >
            {sampleAchievements.map((achievement) => (
              <motion.div
                key={achievement.title}
                variants={cardVariants}
              >
                <Card className="h-full text-center border-0 shadow-lg shadow-black/5 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group">
                  <CardContent className="pt-8 pb-6">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <achievement.icon className={`w-8 h-8 ${achievement.color}`} />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{achievement.title}</h3>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Learn Chess Online Section - SEO Content */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariants}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
              Learn Chess Online — Step by Step
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              RoyalGambit provides a structured path to chess improvement. Whether you&apos;re learning
              how the pieces move or refining your strategic thinking, our free guides and interactive
              lessons will help you grow as a player.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
          >
            {[
              {
                title: 'Beginner-Friendly Chess Basics',
                description: 'Start from zero with our comprehensive guide to piece movement, special rules, and fundamental checkmate patterns.',
              },
              {
                title: 'Interactive Lessons and Practice',
                description: 'Learn by doing with our interactive lessons where you make moves on a real chessboard and get immediate feedback.',
              },
              {
                title: 'Openings, Endgames, and Strategy Tracks',
                description: 'Progress through structured learning tracks covering opening principles, essential endgames, and advanced strategic concepts.',
              },
              {
                title: 'Play vs AI or Friends',
                description: 'Apply what you learn by playing games against our adjustable-strength AI or challenge friends to real-time matches.',
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={cardVariants}
                className="flex items-start gap-4 p-6 rounded-2xl bg-card shadow-lg shadow-black/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Button asChild size="lg" variant="outline" className="rounded-xl h-12 px-8">
              <Link href="/how-it-works">
                How It Works
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* What You Can Learn Section - Links to Guide Pages */}
      <section className="py-24 bg-secondary/50 relative">
        <ChessBoardPattern className="opacity-20" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariants}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
              What You Can Learn
            </h2>
            <p className="text-muted-foreground text-lg">
              Free chess guides for every level — no account required
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
          >
            {chessGuides.map((guide) => (
              <motion.div
                key={guide.title}
                variants={cardVariants}
              >
                <Link href={guide.href}>
                  <Card className="h-full border-0 shadow-lg shadow-black/5 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer group">
                    <CardHeader className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                          <guide.icon className="h-6 w-6 text-primary" />
                        </div>
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${guide.levelColor} text-white`}>
                          {guide.level}
                        </span>
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">{guide.title}</CardTitle>
                      <CardDescription className="text-sm">{guide.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Button asChild size="lg" className="rounded-xl h-12 px-8">
              <Link href="/chess-guides">
                Browse All Guides
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Why Royal Gambit Section */}
      <section className="py-24 relative">
        <FloatingPieces />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariants}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
              Why Royal Gambit?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A modern chess platform designed for learning and playing
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
          >
            {whyRoyalGambit.map((feature) => (
              <motion.div
                key={feature.title}
                variants={cardVariants}
              >
                <Card className="h-full text-center border-0 shadow-lg shadow-black/5 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group">
                  <CardContent className="pt-8 pb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-secondary/50 relative">
        <ChessBoardPattern className="opacity-20" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariants}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <motion.div 
            className="max-w-3xl mx-auto space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
          >
            {homeFaqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
              >
                <Card className="border-0 shadow-lg shadow-black/5 hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <h3 className="font-semibold text-lg mb-3">{faq.question}</h3>
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="max-w-2xl mx-auto border-0 shadow-2xl shadow-primary/10 bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
              <ChessBoardPattern className="opacity-10" />
              <CardContent className="py-16 relative">
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/10">
                  <Crown className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start?</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Create a free account to play against bots, challenge friends, access interactive lessons, and track your progress.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="rounded-xl h-14 px-8 text-lg shadow-lg shadow-primary/25 group">
                    <Link href="/login">
                      Get Started Free
                      <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-6">
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
