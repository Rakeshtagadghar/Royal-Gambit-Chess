'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { LearnUserAchievement, LearnAchievement } from '@/types/learn';
import { cn } from '@/lib/utils';

interface AchievementBadgeProps {
  achievement: LearnAchievement;
  earned?: boolean;
  earnedAt?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AchievementBadge({
  achievement,
  earned = false,
  earnedAt,
  size = 'md',
}: AchievementBadgeProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={cn(
        'flex flex-col items-center gap-2',
        !earned && 'opacity-40 grayscale'
      )}
    >
      <div
        className={cn(
          'rounded-full flex items-center justify-center',
          sizeClasses[size],
          earned ? 'bg-primary/10 ring-2 ring-primary/20' : 'bg-muted'
        )}
      >
        <span>{achievement.icon || '🏆'}</span>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">{achievement.title}</p>
        {earned && earnedAt && (
          <p className="text-xs text-muted-foreground">
            {new Date(earnedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </motion.div>
  );
}

interface AchievementGridProps {
  achievements: (LearnUserAchievement & { achievement: LearnAchievement })[];
  allAchievements?: LearnAchievement[];
}

export function AchievementGrid({ achievements, allAchievements = [] }: AchievementGridProps) {
  const earnedIds = new Set(achievements.map((a) => a.achievementId));

  // Combine earned and unearned achievements
  const displayAchievements = [
    ...achievements.map((ua) => ({
      ...ua.achievement,
      earned: true,
      earnedAt: ua.earnedAt,
    })),
    ...allAchievements
      .filter((a) => !earnedIds.has(a.id))
      .map((a) => ({
        ...a,
        earned: false,
        earnedAt: undefined,
      })),
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
      {displayAchievements.map((achievement, index) => (
        <motion.div
          key={achievement.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <AchievementBadge
            achievement={achievement}
            earned={achievement.earned}
            earnedAt={achievement.earnedAt}
          />
        </motion.div>
      ))}
    </div>
  );
}

interface RecentAchievementProps {
  userAchievement: LearnUserAchievement & { achievement?: LearnAchievement };
}

export function RecentAchievementCard({ userAchievement }: RecentAchievementProps) {
  const achievement = userAchievement.achievement;
  if (!achievement) return null;

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
          {achievement.icon || '🏆'}
        </div>
        <div className="flex-1">
          <p className="text-xs text-primary uppercase tracking-wider">
            Achievement Unlocked!
          </p>
          <p className="font-semibold">{achievement.title}</p>
          {achievement.description && (
            <p className="text-sm text-muted-foreground">{achievement.description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
