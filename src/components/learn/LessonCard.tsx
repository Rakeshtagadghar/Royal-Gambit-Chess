'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LearnLessonWithProgress,
  TOPIC_LABELS,
  TOPIC_ICONS,
  LEVEL_COLORS,
  LEVEL_LABELS,
} from '@/types/learn';
import { cn } from '@/lib/utils';
import { Clock, Lock, CheckCircle2, PlayCircle } from 'lucide-react';

interface LessonCardProps {
  lesson: LearnLessonWithProgress;
  index?: number;
  showLevel?: boolean;
}

export function LessonCard({ lesson, index = 0, showLevel = false }: LessonCardProps) {
  const isLocked = lesson.isLocked;
  const isCompleted = lesson.progress?.status === 'completed';
  const isInProgress = lesson.progress?.status === 'in_progress';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      {isLocked ? (
        <Card className="opacity-60 cursor-not-allowed">
          <CardContent className="p-4">
            <LessonCardInner
              lesson={lesson}
              isLocked={isLocked}
              isCompleted={isCompleted}
              isInProgress={isInProgress}
              showLevel={showLevel}
            />
          </CardContent>
        </Card>
      ) : (
        <Link href={`/learn/lesson/${lesson.slug}`}>
          <Card className="hover:border-primary/50 transition-all hover:shadow-md group cursor-pointer">
            <CardContent className="p-4">
              <LessonCardInner
                lesson={lesson}
                isLocked={isLocked}
                isCompleted={isCompleted}
                isInProgress={isInProgress}
                showLevel={showLevel}
              />
            </CardContent>
          </Card>
        </Link>
      )}
    </motion.div>
  );
}

interface LessonCardInnerProps {
  lesson: LearnLessonWithProgress;
  isLocked: boolean;
  isCompleted: boolean;
  isInProgress: boolean;
  showLevel: boolean;
}

function LessonCardInner({
  lesson,
  isLocked,
  isCompleted,
  isInProgress,
  showLevel,
}: LessonCardInnerProps) {
  const t = useTranslations('learn');
  return (
    <div className="flex items-start gap-4">
      {/* Status icon */}
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
          isCompleted && 'bg-green-500/10',
          isInProgress && 'bg-primary/10',
          isLocked && 'bg-muted',
          !isCompleted && !isInProgress && !isLocked && 'bg-muted'
        )}
      >
        {isLocked ? (
          <Lock className="w-5 h-5 text-muted-foreground" />
        ) : isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : isInProgress ? (
          <PlayCircle className="w-5 h-5 text-primary" />
        ) : (
          <span className="text-lg">{TOPIC_ICONS[lesson.topic]}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="secondary" className="text-xs">
            {TOPIC_LABELS[lesson.topic]}
          </Badge>
          {showLevel && (
            <Badge
              variant="outline"
              className={cn('text-xs', LEVEL_COLORS[lesson.level])}
            >
              {LEVEL_LABELS[lesson.level]}
            </Badge>
          )}
        </div>

        <h3 className="font-medium group-hover:text-primary transition-colors truncate">
          {lesson.title}
        </h3>

        {lesson.description && (
          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
            {lesson.description}
          </p>
        )}

        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{lesson.estimatedMinutes} {t('minUnit')}</span>
          </div>

          {isInProgress && lesson.progress && (
            <span className="text-primary">
              {t('stepN', { step: lesson.progress.lastStepIndex + 1 })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
