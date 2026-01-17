'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { LearnProgressData } from '@/types/learn';
import { BookOpen, Target, Clock, Flame, Trophy } from 'lucide-react';

interface ProgressStatsProps {
  stats: LearnProgressData['stats'];
}

export function ProgressStats({ stats }: ProgressStatsProps) {
  const statItems = [
    {
      label: 'Lessons Completed',
      value: stats.totalLessonsCompleted,
      icon: BookOpen,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Puzzles Solved',
      value: stats.totalPuzzlesSolved,
      icon: Target,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Puzzle Accuracy',
      value: `${stats.puzzleAccuracy}%`,
      icon: Trophy,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'Time Spent',
      value: formatTime(stats.totalTimeSpentMinutes),
      icon: Clock,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Current Streak',
      value: `${stats.currentStreak} days`,
      icon: Flame,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakDisplay({ currentStreak, longestStreak }: StreakDisplayProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-xl">
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
            <div>
              <p className="text-3xl font-bold">{currentStreak}</p>
              <p className="text-sm text-muted-foreground">Day streak</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-muted-foreground">Best streak</p>
            <p className="text-xl font-semibold">{longestStreak} days</p>
          </div>
        </div>

        {/* Streak visualization */}
        <div className="mt-4 flex gap-1">
          {Array.from({ length: 7 }).map((_, i) => {
            const isActive = i < Math.min(currentStreak, 7);
            return (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`flex-1 h-2 rounded-full ${
                  isActive ? 'bg-orange-500' : 'bg-muted'
                }`}
              />
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {currentStreak >= 7
            ? 'Amazing! Keep the streak going!'
            : `${7 - currentStreak} more days to reach a week!`}
        </p>
      </CardContent>
    </Card>
  );
}
