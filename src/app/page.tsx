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
  Github
} from 'lucide-react';

const features = [
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

export default function HomePage() {
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
                A modern chess platform.
                <br />
                Play against bots, friends, or find opponents online.
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
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
                <h2 className="text-3xl font-bold mb-4">Ready to Play?</h2>
                <p className="text-muted-foreground mb-6">
                  No account required to play against the bot. Sign up to play online and track your games.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg">
                    <Link href="/bot">
                      <Bot className="mr-2 h-5 w-5" />
                      Play vs Bot
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/login">
                      <Users className="mr-2 h-5 w-5" />
                      Play Online
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">♟</span>
              <span className="font-semibold">RoyalGambit</span>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Github className="h-4 w-4" />
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
