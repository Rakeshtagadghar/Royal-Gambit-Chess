'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InvitationsPanel } from '@/components/invitations/InvitationsPanel';
import { Bot, Users, UserPlus, Zap, Clock, Trophy } from 'lucide-react';
import { toast } from 'sonner';

const gameModes = [
  {
    id: 'bot',
    title: 'Play vs Bot',
    description: 'Challenge Stockfish at various difficulty levels',
    icon: Bot,
    href: '/bot',
    badge: 'No account needed',
    badgeVariant: 'secondary' as const,
    features: ['5 difficulty levels', 'Instant start', 'Practice mode'],
  },
  {
    id: 'friend',
    title: 'Play vs Friend',
    description: 'Create a private game and share the link',
    icon: Users,
    href: '/lobby?mode=friend',
    badge: 'Realtime',
    badgeVariant: 'default' as const,
    features: ['Share link to invite', 'Custom time controls', 'Rematch option'],
  },
  {
    id: 'matchmaking',
    title: 'Find Opponent',
    description: 'Quick match with another player',
    icon: UserPlus,
    href: '/lobby?mode=queue',
    badge: 'Quick match',
    badgeVariant: 'default' as const,
    features: ['Automatic pairing', 'Skill-based (coming)', 'Multiple time controls'],
  },
];

const timeControls = [
  { icon: Zap, label: 'Bullet', times: ['1+0', '2+1'] },
  { icon: Clock, label: 'Blitz', times: ['3+0', '5+0', '5+3'] },
  { icon: Trophy, label: 'Rapid', times: ['10+0', '15+10'] },
];

function VerificationToast() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast.success('Email verified!', {
        description: 'Your account is now active. Welcome to RoyalGambit!',
      });
      // Clean up URL
      window.history.replaceState({}, '', '/play');
    }
  }, [searchParams]);
  
  return null;
}

export default function PlayPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Suspense fallback={null}>
        <VerificationToast />
      </Suspense>
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Choose Game Mode</h1>
          <p className="text-muted-foreground">
            Select how you want to play
          </p>
        </motion.div>

        {/* Game Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {gameModes.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={mode.href}>
                <Card className="h-full hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <mode.icon className="h-10 w-10 text-primary group-hover:scale-110 transition-transform" />
                      <Badge variant={mode.badgeVariant}>{mode.badge}</Badge>
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {mode.title}
                    </CardTitle>
                    <CardDescription>{mode.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {mode.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Invitations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <InvitationsPanel />
        </motion.div>

        {/* Time Controls Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold mb-4">Available Time Controls</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {timeControls.map((tc) => (
              <Card key={tc.label}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <tc.icon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{tc.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {tc.times.join(', ')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

