'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CachedAvatarImage } from '@/components/ui/cached-avatar-image';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { LeaderboardEntry, RatingMode } from '@/types/chess';
import {
  Trophy,
  Medal,
  Flame,
  Zap,
  Timer,
  Clock,
  Loader2,
  TrendingUp,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiUrls } from '@/lib/api/urls';

const MODE_ICONS: Record<RatingMode, { icon: React.ReactNode; color: string }> = {
  bullet: { icon: <Zap className="h-4 w-4" />, color: 'text-yellow-500' },
  blitz: { icon: <Flame className="h-4 w-4" />, color: 'text-orange-500' },
  rapid: { icon: <Timer className="h-4 w-4" />, color: 'text-blue-500' },
  classical: { icon: <Clock className="h-4 w-4" />, color: 'text-purple-500' },
};

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
  return null;
}

function getRankBgClass(rank: number) {
  if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-yellow-500/30';
  if (rank === 2) return 'bg-gradient-to-r from-gray-400/20 to-slate-400/10 border-gray-400/30';
  if (rank === 3) return 'bg-gradient-to-r from-amber-600/20 to-orange-600/10 border-amber-600/30';
  return 'hover:bg-muted/50';
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations('leaderboard');
  const [activeMode, setActiveMode] = useState<RatingMode>('blitz');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);

  const userId = user?.id;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(apiUrls.leaderboard.get({ mode: activeMode, limit: 100 }));
        if (!response.ok) throw new Error('Failed to fetch leaderboard');

        const data = await response.json();
        setLeaderboard(data.leaderboard || []);

        // Find user's rank if logged in
        if (userId) {
          const userEntry = data.leaderboard?.find(
            (entry: LeaderboardEntry) => entry.userId === userId
          );
          setUserRank(userEntry || null);
        } else {
          setUserRank(null);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        setLeaderboard([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [activeMode, userId]);

  const modeLabel = t(activeMode);
  const modeIcons = MODE_ICONS[activeMode];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Trophy className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">{t('title')}</h1>
              <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>
          </div>

          {/* Mode Tabs */}
          <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as RatingMode)} className="mb-6">
            <TabsList className="grid w-full grid-cols-4">
              {(Object.keys(MODE_ICONS) as RatingMode[]).map((mode) => (
                <TabsTrigger key={mode} value={mode} className="gap-2">
                  <span className={MODE_ICONS[mode].color}>{MODE_ICONS[mode].icon}</span>
                  <span className="hidden sm:inline">{t(mode)}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* User's Rank Card (if logged in and ranked) */}
          {userRank && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6"
            >
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-primary">#{userRank.rank}</div>
                      <Avatar className="h-10 w-10 border-2 border-primary">
                        <CachedAvatarImage src={userRank.avatarUrl} alt={userRank.username} />
                        <AvatarFallback>{userRank.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{userRank.displayName || userRank.username}</div>
                        <div className="text-sm text-muted-foreground">{t('yourRanking')}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{userRank.elo}</div>
                      <div className="text-sm text-muted-foreground">
                        {t('record', { wins: userRank.wins, losses: userRank.losses, draws: userRank.draws })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Leaderboard Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className={modeIcons.color}>{modeIcons.icon}</span>
                {t('rankings', { mode: modeLabel })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">{t('noPlayersRanked', { mode: modeLabel })}</p>
                  <p className="text-sm text-muted-foreground mt-2">{t('beFirstToPlay')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
                    <div className="col-span-1">{t('columnRank')}</div>
                    <div className="col-span-5">{t('columnPlayer')}</div>
                    <div className="col-span-2 text-right">{t('columnRating')}</div>
                    <div className="col-span-2 text-right hidden sm:block">{t('columnWLD')}</div>
                    <div className="col-span-2 text-right">{t('columnGames')}</div>
                  </div>

                  {/* Rows */}
                  <AnimatePresence>
                    {leaderboard.map((entry, index) => (
                      <motion.div
                        key={entry.userId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => router.push(`/u/${entry.username}`)}
                        className={cn(
                          'grid grid-cols-12 gap-4 px-4 py-3 rounded-lg cursor-pointer transition-colors border border-transparent',
                          getRankBgClass(entry.rank),
                          entry.userId === user?.id && 'ring-1 ring-primary'
                        )}
                      >
                        <div className="col-span-1 flex items-center">
                          {getRankIcon(entry.rank) || (
                            <span className="text-muted-foreground font-medium">{entry.rank}</span>
                          )}
                        </div>
                        <div className="col-span-5 flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <CachedAvatarImage src={entry.avatarUrl} alt={entry.username} />
                            <AvatarFallback className="text-xs">
                              {entry.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {entry.displayName || entry.username}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              @{entry.username}
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2 flex items-center justify-end">
                          <Badge variant="secondary" className="font-mono">
                            {entry.elo}
                          </Badge>
                        </div>
                        <div className="col-span-2 hidden sm:flex items-center justify-end text-sm text-muted-foreground">
                          <span className="text-green-500">{entry.wins}</span>
                          <span className="mx-1">/</span>
                          <span className="text-red-500">{entry.losses}</span>
                          <span className="mx-1">/</span>
                          <span className="text-yellow-500">{entry.draws}</span>
                        </div>
                        <div className="col-span-2 flex items-center justify-end text-sm text-muted-foreground">
                          {entry.gamesPlayed}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
