'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearnPracticePack, LEVEL_LABELS, LEVEL_COLORS, TOPIC_LABELS } from '@/types/learn';
import { cn } from '@/lib/utils';
import { Target } from 'lucide-react';

interface PracticePackCardProps {
  pack: LearnPracticePack & { puzzleCount?: number; solvedCount?: number };
  index?: number;
}

export function PracticePackCard({ pack, index = 0 }: PracticePackCardProps) {
  const t = useTranslations('learn');
  const puzzleCount = pack.puzzleCount || 0;
  const solvedCount = pack.solvedCount || 0;
  const progress = puzzleCount > 0 ? Math.round((solvedCount / puzzleCount) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/learn/practice/${pack.slug}`}>
        <Card className="h-full hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 group cursor-pointer">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn('text-xs', LEVEL_COLORS[pack.level])}
              >
                {LEVEL_LABELS[pack.level]}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {TOPIC_LABELS[pack.topic]}
              </Badge>
            </div>
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              {pack.title}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {pack.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {pack.description}
              </p>
            )}

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Target className="w-3.5 h-3.5" />
              <span>{t('nPuzzles', { count: puzzleCount })}</span>
            </div>

            {/* Progress bar */}
            {puzzleCount > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {t('solvedProgress', { solved: solvedCount, total: puzzleCount })}
                  </span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
