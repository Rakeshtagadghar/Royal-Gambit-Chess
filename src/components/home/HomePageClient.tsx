'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from "@/i18n/navigation";
import { SITE_CONFIG } from "@/lib/config";
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
  MousePointerClick,
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { useRef, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

const playFeatures = [
  {
    icon: Bot,
    titleKey: 'playVsBot',
    descriptionKey: 'playVsBotDesc',
  },
  {
    icon: Users,
    titleKey: 'playVsFriends',
    descriptionKey: 'playVsFriendsDesc',
  },
  {
    icon: Trophy,
    titleKey: 'matchmaking',
    descriptionKey: 'matchmakingDesc',
  },
];

const learnFeatures = [
  {
    icon: GraduationCap,
    titleKey: 'interactiveLessons',
    descriptionKey: 'interactiveLessonsDesc',
  },
  {
    icon: Puzzle,
    titleKey: 'practicePuzzles',
    descriptionKey: 'practicePuzzlesDesc',
  },
  {
    icon: Award,
    titleKey: 'achievements',
    descriptionKey: 'achievementsDesc',
  },
];

const platformFeatures = [
  {
    icon: Clock,
    titleKey: 'timeControls',
    descriptionKey: 'timeControlsDesc',
  },
  {
    icon: Shield,
    titleKey: 'secureFair',
    descriptionKey: 'secureFairDesc',
  },
  {
    icon: Zap,
    titleKey: 'lightningFast',
    descriptionKey: 'lightningFastDesc',
  },
];

const learningTracks = [
  {
    levelKey: 'beginner',
    titleKey: 'chessBasicsTitle',
    descriptionKey: 'chessBasicsDesc',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
  },
  {
    levelKey: 'intermediate',
    titleKey: 'tacticsPatterns',
    descriptionKey: 'tacticsPatternsDesc',
    color: 'from-sky-500 to-blue-500',
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-700',
  },
  {
    levelKey: 'advanced',
    titleKey: 'strategyPlanning',
    descriptionKey: 'strategyPlanningDesc',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
  },
  {
    levelKey: 'expert',
    titleKey: 'masterTechniques',
    descriptionKey: 'masterTechniquesDesc',
    color: 'from-rose-500 to-red-500',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700',
  },
];

const sampleAchievements = [
  { icon: Target, titleKey: 'firstSteps', descriptionKey: 'firstStepsDesc', color: 'text-emerald-500' },
  { icon: Zap, titleKey: 'onFire', descriptionKey: 'onFireDesc', color: 'text-orange-500' },
  { icon: Puzzle, titleKey: 'puzzleMaster', descriptionKey: 'puzzleMasterDesc', color: 'text-sky-500' },
  { icon: Crown, titleKey: 'trackChampion', descriptionKey: 'trackChampionDesc', color: 'text-amber-500' },
];

const chessGuides = [
  {
    titleKey: 'chessBasicsTitle',
    descriptionKey: 'chessBasicsGuideDesc',
    href: '/learn/chess-basics',
    icon: Crown,
    levelKey: 'beginner',
    levelColor: 'bg-emerald-500',
  },
  {
    titleKey: 'openingPrinciples',
    descriptionKey: 'openingPrinciplesDesc',
    href: '/learn/opening-principles',
    icon: Swords,
    levelKey: 'intermediate',
    levelColor: 'bg-sky-500',
  },
  {
    titleKey: 'essentialEndgames',
    descriptionKey: 'essentialEndgamesDesc',
    href: '/learn/essential-endgames',
    icon: Flag,
    levelKey: 'intermediate',
    levelColor: 'bg-sky-500',
  },
  {
    titleKey: 'strategicThinking',
    descriptionKey: 'strategicThinkingDesc',
    href: '/learn/strategic-thinking',
    icon: Brain,
    levelKey: 'advanced',
    levelColor: 'bg-amber-500',
  },
];

const homeFaqs = [
  {
    questionKey: 'faqQuestion1',
    answerKey: 'faqAnswer1',
  },
  {
    questionKey: 'faqQuestion2',
    answerKey: 'faqAnswer2',
  },
  {
    questionKey: 'faqQuestion3',
    answerKey: 'faqAnswer3',
  },
];

const whyRoyalGambit = [
  {
    icon: BookOpen,
    titleKey: 'comprehensiveLearning',
    descriptionKey: 'comprehensiveLearningDesc',
  },
  {
    icon: Target,
    titleKey: 'focusedPractice',
    descriptionKey: 'focusedPracticeDesc',
  },
  {
    icon: Bot,
    titleKey: 'adjustableAI',
    descriptionKey: 'adjustableAIDesc',
  },
  {
    icon: Shield,
    titleKey: 'fairPlay',
    descriptionKey: 'fairPlayDesc',
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
      type: "spring" as const,
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
      ease: [0.22, 1, 0.36, 1] as const,
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

// Interactive mini chess board for hero section
function InteractiveChessBoard() {
  const t = useTranslations('home');
  const [hoveredSquare, setHoveredSquare] = useState<string | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [pieces, setPieces] = useState<Record<string, { type: string; color: 'w' | 'b' }>>({
    'e1': { type: 'king', color: 'w' },
    'd1': { type: 'queen', color: 'w' },
    'a1': { type: 'rook', color: 'w' },
    'h1': { type: 'rook', color: 'w' },
    'c1': { type: 'bishop', color: 'w' },
    'f1': { type: 'bishop', color: 'w' },
    'b1': { type: 'knight', color: 'w' },
    'g1': { type: 'knight', color: 'w' },
    'a2': { type: 'pawn', color: 'w' },
    'b2': { type: 'pawn', color: 'w' },
    'c2': { type: 'pawn', color: 'w' },
    'd2': { type: 'pawn', color: 'w' },
    'e4': { type: 'pawn', color: 'w' },
    'f2': { type: 'pawn', color: 'w' },
    'g2': { type: 'pawn', color: 'w' },
    'h2': { type: 'pawn', color: 'w' },
    'e8': { type: 'king', color: 'b' },
    'd8': { type: 'queen', color: 'b' },
    'a8': { type: 'rook', color: 'b' },
    'h8': { type: 'rook', color: 'b' },
    'c8': { type: 'bishop', color: 'b' },
    'f8': { type: 'bishop', color: 'b' },
    'b8': { type: 'knight', color: 'b' },
    'g8': { type: 'knight', color: 'b' },
    'a7': { type: 'pawn', color: 'b' },
    'b7': { type: 'pawn', color: 'b' },
    'c7': { type: 'pawn', color: 'b' },
    'd7': { type: 'pawn', color: 'b' },
    'e5': { type: 'pawn', color: 'b' },
    'f7': { type: 'pawn', color: 'b' },
    'g7': { type: 'pawn', color: 'b' },
    'h7': { type: 'pawn', color: 'b' },
  });

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

  const getPieceSymbol = (type: string, color: 'w' | 'b') => {
    const symbols: Record<string, Record<string, string>> = {
      king: { w: '♔', b: '♚' },
      queen: { w: '♕', b: '♛' },
      rook: { w: '♖', b: '♜' },
      bishop: { w: '♗', b: '♝' },
      knight: { w: '♘', b: '♞' },
      pawn: { w: '♙', b: '♟' },
    };
    return symbols[type]?.[color] || '';
  };

  const handleSquareClick = (square: string) => {
    if (selectedPiece === square) {
      setSelectedPiece(null);
    } else if (pieces[square]) {
      setSelectedPiece(square);
    } else if (selectedPiece) {
      // Move piece
      setPieces(prev => {
        const newPieces = { ...prev };
        newPieces[square] = newPieces[selectedPiece];
        delete newPieces[selectedPiece];
        return newPieces;
      });
      setSelectedPiece(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      transition={{ duration: 0.8, delay: 0.5, type: "spring" }}
      className="relative perspective-1000"
    >
      <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-primary/10 bg-card/50 backdrop-blur-sm p-3">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />

        <div className="grid grid-cols-8 gap-0 relative">
          {ranks.map((rank) =>
            files.map((file) => {
              const square = `${file}${rank}`;
              const isLight = (files.indexOf(file) + rank) % 2 === 1;
              const piece = pieces[square];
              const isHovered = hoveredSquare === square;
              const isSelected = selectedPiece === square;

              return (
                <motion.div
                  key={square}
                  className={`
                    w-8 h-8 md:w-10 md:h-10 flex items-center justify-center cursor-pointer relative
                    transition-colors duration-200
                    ${isLight ? 'bg-amber-100' : 'bg-amber-800'}
                    ${isHovered && !piece ? 'ring-2 ring-primary/50 ring-inset' : ''}
                    ${isSelected ? 'ring-2 ring-primary ring-inset bg-primary/30' : ''}
                  `}
                  onMouseEnter={() => setHoveredSquare(square)}
                  onMouseLeave={() => setHoveredSquare(null)}
                  onClick={() => handleSquareClick(square)}
                  whileHover={{ scale: piece ? 1.05 : 1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <AnimatePresence mode="wait">
                    {piece && (
                      <motion.span
                        key={`${square}-${piece.type}`}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={`text-2xl md:text-3xl select-none ${piece.color === 'w' ? 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]' : 'text-gray-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]'
                          } ${isSelected ? 'animate-pulse' : ''}`}
                      >
                        {getPieceSymbol(piece.type, piece.color)}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Highlight dot for empty hovered squares when piece selected */}
                  {selectedPiece && !piece && isHovered && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute w-3 h-3 rounded-full bg-primary/40"
                    />
                  )}
                </motion.div>
              );
            })
          )}
        </div>

        {/* Interactive hint */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap"
        >
          <MousePointerClick className="w-3 h-3" />
          {t('clickToMove')}
        </motion.div>
      </div>
    </motion.div>
  );
}

// Animated stats counter
function AnimatedStat({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const duration = 2000;
    const increment = value / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <div ref={ref} className="text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 100 }}
        className="text-4xl md:text-5xl font-bold text-primary"
      >
        {count.toLocaleString()}{suffix}
      </motion.div>
      <p className="text-muted-foreground text-sm mt-1">{label}</p>
    </div>
  );
}

// Live activity pulse indicator
function LiveActivityPulse() {
  const [pulses, setPulses] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulses(prev => [...prev.slice(-4), Date.now()]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
        {pulses.map((id) => (
          <motion.div
            key={id}
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500"
          />
        ))}
      </div>
      <span className="text-sm text-emerald-600 font-medium"><TranslatedLiveGames /></span>
    </div>
  );
}

function TranslatedLiveGames() {
  const t = useTranslations('home');
  return <>{t('liveGames')}</>;
}

// Custom cursor follower for landing page - elegant and minimal
function CustomCursor() {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isMounted] = useState(() => typeof window !== 'undefined');

  useEffect(() => {
    if (!isMounted) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [role="button"], input, textarea')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isMounted]);

  // Don't render on server or mobile
  if (!isMounted) return null;

  return (
    <>
      {/* Elegant outer glow ring */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] hidden lg:flex items-center justify-center"
        style={{
          background: isHovering
            ? 'radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
        }}
        animate={{
          x: mousePos.x - 16,
          y: mousePos.y - 16,
          scale: isHovering ? 2 : isClicking ? 0.8 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          mass: 0.5,
        }}
      />

      {/* Inner dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-primary rounded-full pointer-events-none z-[9999] hidden lg:block"
        animate={{
          x: mousePos.x - 4,
          y: mousePos.y - 4,
          scale: isClicking ? 0.5 : isHovering ? 0.8 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
        }}
      />
    </>
  );
}

// Animated grid background
function AnimatedGridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-foreground/[0.04]" />
          </pattern>
          <linearGradient id="grid-fade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="20%" stopColor="white" stopOpacity="1" />
            <stop offset="80%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="grid-mask">
            <rect width="100%" height="100%" fill="url(#grid-fade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" mask="url(#grid-mask)" />
      </svg>

      {/* Animated scan line */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        initial={{ top: "0%" }}
        animate={{ top: "100%" }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}

// Floating particles - generated client-side to avoid hydration mismatch
function FloatingParticles() {
  const [particles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
    xOffset: number;
  }>>(() => {
    // Generate particles only on client to avoid hydration issues
    if (typeof window === 'undefined') return [];
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 2,
      duration: Math.random() * 8 + 12,
      delay: Math.random() * 5,
      xOffset: Math.random() * 40 - 20,
    }));
  });

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/15"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -80, 0],
            x: [0, particle.xOffset, 0],
            opacity: [0, 0.5, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Morphing gradient blob
function MorphingBlob({ className, color }: { className?: string; color: string }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${color} ${className}`}
      animate={{
        borderRadius: [
          "60% 40% 30% 70% / 60% 30% 70% 40%",
          "30% 60% 70% 40% / 50% 60% 30% 60%",
          "60% 40% 30% 70% / 60% 30% 70% 40%",
        ],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// Glowing orb with mouse interaction
function InteractiveGlowOrb() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isMounted] = useState(() => typeof window !== 'undefined');

  useEffect(() => {
    if (!isMounted) return;
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMounted]);

  if (!isMounted) return null;

  return (
    <motion.div
      className="absolute w-[500px] h-[500px] rounded-full pointer-events-none opacity-60"
      style={{
        background: `radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, transparent 70%)`,
        filter: "blur(80px)",
      }}
      animate={{
        left: `calc(${mousePos.x}% - 250px)`,
        top: `calc(${mousePos.y}% - 250px)`,
      }}
      transition={{
        type: "spring",
        stiffness: 30,
        damping: 25,
      }}
    />
  );
}

export function HomePageClient() {
  const t = useTranslations('home');
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
    <div className="min-h-screen flex flex-col bg-background lg:cursor-none">
      {/* Custom cursor - only on desktop */}
      <CustomCursor />

      <Navbar />

      {/* Hero Section */}
      <section ref={heroRef} className="relative flex-1 flex items-center justify-center overflow-hidden min-h-[100vh]">
        {/* Animated grid background */}
        <AnimatedGridBackground />

        {/* Interactive glow that follows mouse */}
        <InteractiveGlowOrb />

        {/* Floating particles */}
        <FloatingParticles />

        {/* Background Image Layer */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{ y: imageParallax }}
        >
          <Image
            src="/images/chess-hero.jpg"
            alt=""
            fill
            className="object-cover opacity-[0.06]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        </motion.div>

        {/* Chess board pattern overlay */}
        <ChessBoardPattern className="opacity-30" />

        {/* Floating chess pieces */}
        <FloatingPieces />

        {/* Morphing gradient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <MorphingBlob
            className="top-10 left-10 w-80 h-80"
            color="bg-primary/10"
          />
          <MorphingBlob
            className="bottom-20 right-10 w-96 h-96"
            color="bg-accent/8"
          />
          <MorphingBlob
            className="top-1/3 right-1/4 w-64 h-64"
            color="bg-emerald-500/5"
          />

          {/* Center radial gradient */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-full blur-3xl" />
          </div>

          {/* Subtle noise texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="container mx-auto px-4 py-12 md:py-20 relative z-10"
        >
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Text content */}
              <div className="text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20 backdrop-blur-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    {t('badge')}
                  </motion.div>

                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
                    <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text">Royal</span>
                    <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">Gambit</span>
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed text-balance">
                    {t('tagline')}
                    {' '}{t('subtitle')}
                  </p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
                  >
                    <Button asChild size="lg" className="text-lg px-8 h-14 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all duration-300 group">
                      <Link href="/play">
                        <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                        {t('playNow')}
                        <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="text-lg px-8 h-14 rounded-xl border-2 hover:bg-secondary backdrop-blur-sm transition-all duration-300">
                      <Link href="/login">
                        {t('signIn')}
                      </Link>
                    </Button>
                  </motion.div>

                  {/* Live activity indicator */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="flex justify-center lg:justify-start"
                  >
                    <LiveActivityPulse />
                  </motion.div>
                </motion.div>
              </div>

              {/* Right side - Interactive Chess Board */}
              <div className="flex justify-center lg:justify-end">
                <InteractiveChessBoard />
              </div>
            </div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-16 md:mt-24 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              <AnimatedStat value={50000} label={t('gamesPlayed')} suffix="+" />
              <AnimatedStat value={500} label={t('activePlayers')} suffix="+" />
              <AnimatedStat value={100} label={t('chessPuzzles')} suffix="+" />
            </motion.div>

            {/* Animated chess pieces row */}
            <motion.div
              className="mt-12 md:mt-16 flex justify-center gap-3 md:gap-6"
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
              {t('artOfChess')}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('artOfChessDesc')}
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
                  <h3 className="text-2xl font-bold mb-2">{t('masterTheGame')}</h3>
                  <p className="text-white/80 text-sm">{t('masterTheGameDesc')}</p>
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
                  <h3 className="text-2xl font-bold mb-2">{t('immersiveExperience')}</h3>
                  <p className="text-white/80 text-sm">{t('immersiveExperienceDesc')}</p>
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
              {t('everythingYouNeed')}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('everythingYouNeedDesc')}
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
              {t('sectionPlay')}
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
                  key={feature.titleKey}
                  variants={cardVariants}
                >
                  <Card className="h-full border-0 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 bg-card/80 backdrop-blur-sm group hover:-translate-y-1">
                    <CardHeader className="space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                        <feature.icon className="h-7 w-7 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{t(feature.titleKey)}</CardTitle>
                      <CardDescription className="text-base">{t(feature.descriptionKey)}</CardDescription>
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
              {t('sectionLearnImprove')}
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
                  key={feature.titleKey}
                  variants={cardVariants}
                >
                  <Card className="h-full border-0 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-accent/10 transition-all duration-500 bg-card/80 backdrop-blur-sm group hover:-translate-y-1">
                    <CardHeader className="space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                        <feature.icon className="h-7 w-7 text-accent" />
                      </div>
                      <CardTitle className="text-xl">{t(feature.titleKey)}</CardTitle>
                      <CardDescription className="text-base">{t(feature.descriptionKey)}</CardDescription>
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
              {t('sectionPlatform')}
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
                  key={feature.titleKey}
                  variants={cardVariants}
                >
                  <Card className="h-full border-0 shadow-lg shadow-black/5 hover:shadow-xl transition-all duration-500 bg-card/80 backdrop-blur-sm group hover:-translate-y-1">
                    <CardHeader className="space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-muted/80 group-hover:scale-110 transition-all duration-300">
                        <feature.icon className="h-7 w-7 text-muted-foreground" />
                      </div>
                      <CardTitle className="text-xl">{t(feature.titleKey)}</CardTitle>
                      <CardDescription className="text-base">{t(feature.descriptionKey)}</CardDescription>
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
              {t('structuredPaths')}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t('structuredPathsDesc')}
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
                key={track.titleKey}
                variants={cardVariants}
              >
                <Card className="h-full overflow-hidden border-0 shadow-lg shadow-black/5 hover:shadow-xl transition-all duration-500 group hover:-translate-y-2">
                  <div className={`h-1.5 bg-gradient-to-r ${track.color}`} />
                  <CardHeader className="pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full bg-gradient-to-r ${track.color} text-white shadow-sm`}>
                        {t(track.levelKey)}
                      </span>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">{t(track.titleKey)}</CardTitle>
                    <CardDescription className="text-sm">{t(track.descriptionKey)}</CardDescription>
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
              {t('earnAchievements')}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t('earnAchievementsDesc')}
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
                key={achievement.titleKey}
                variants={cardVariants}
              >
                <Card className="h-full text-center border-0 shadow-lg shadow-black/5 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group">
                  <CardContent className="pt-8 pb-6">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <achievement.icon className={`w-8 h-8 ${achievement.color}`} />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{t(achievement.titleKey)}</h3>
                    <p className="text-xs text-muted-foreground">{t(achievement.descriptionKey)}</p>
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
              {t('learnOnline')}
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              {t('learnOnlineDesc', { appName: SITE_CONFIG.name })}
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
                title: t('beginnerBasics'),
                description: t('beginnerBasicsDesc'),
              },
              {
                title: t('interactivePractice'),
                description: t('interactivePracticeDesc'),
              },
              {
                title: t('openingsEndgames'),
                description: t('openingsEndgamesDesc'),
              },
              {
                title: t('playVsAI'),
                description: t('playVsAIDesc'),
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
                {t('howItWorks')}
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
              {t('whatYouCanLearn')}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t('whatYouCanLearnDesc')}
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
                key={guide.titleKey}
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
                          {t(guide.levelKey)}
                        </span>
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">{t(guide.titleKey)}</CardTitle>
                      <CardDescription className="text-sm">{t(guide.descriptionKey)}</CardDescription>
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
                {t('browseAllGuides')}
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
              {t('whyRoyalGambit', { appName: SITE_CONFIG.name })}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('whyRoyalGambitDesc', { appName: SITE_CONFIG.name })}
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
                key={feature.titleKey}
                variants={cardVariants}
              >
                <Card className="h-full text-center border-0 shadow-lg shadow-black/5 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group">
                  <CardContent className="pt-8 pb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{t(feature.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground">{t(feature.descriptionKey)}</p>
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
              {t('faqTitle')}
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
                    <h3 className="font-semibold text-lg mb-3">{t(faq.questionKey)}</h3>
                    <p className="text-muted-foreground leading-relaxed">{t(faq.answerKey)}</p>
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
                <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('readyToStart')}</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  {t('readyToStartDesc')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="rounded-xl h-14 px-8 text-lg shadow-lg shadow-primary/25 group">
                    <Link href="/login">
                      {t('getStartedFree')}
                      <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-6">
                  {t('noCardRequired')}
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
