'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearnTrackWithProgress, LEVEL_LABELS, LEVEL_COLORS } from '@/types/learn';
import { cn } from '@/lib/utils';
import { Clock, BookOpen, CheckCircle2 } from 'lucide-react';

interface TrackCardProps {
  track: LearnTrackWithProgress;
  index?: number;
}

export function TrackCard({ track, index = 0 }: TrackCardProps) {
  const completionPercentage = Math.round(track.completionPercentage || 0);
  const isStarted = track.completedLessons > 0 || track.inProgressLessons > 0;
  const isCompleted = completionPercentage === 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/learn/track/${track.slug}`}>
        <Card className="h-full hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 group cursor-pointer">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <Badge
                variant="outline"
                className={cn('text-xs', LEVEL_COLORS[track.level])}
              >
                {LEVEL_LABELS[track.level]}
              </Badge>
              {isCompleted && (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
            </div>
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              {track.title}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {track.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {track.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{track.totalLessons} lessons</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{track.estimatedHours}h</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {isStarted
                    ? `${track.completedLessons}/${track.totalLessons} completed`
                    : 'Not started'}
                </span>
                <span className="font-medium">{completionPercentage}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
