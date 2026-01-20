'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, ThumbsUp, AlertCircle, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import { EvaluationBadge } from './EvaluationBar';
import type { MoveAnalysis, MoveClassification } from '@/types/chess';

interface MoveDetailPanelProps {
  move: MoveAnalysis | null;
  className?: string;
}

const classificationConfig: Record<
  MoveClassification,
  { icon: typeof Star; color: string; bgColor: string; label: string }
> = {
  best: { icon: Star, color: 'text-green-500', bgColor: 'bg-green-500/20', label: 'Best move' },
  good: { icon: ThumbsUp, color: 'text-blue-500', bgColor: 'bg-blue-500/20', label: 'Good move' },
  inaccuracy: { icon: AlertCircle, color: 'text-yellow-500', bgColor: 'bg-yellow-500/20', label: 'Inaccuracy' },
  mistake: { icon: AlertTriangle, color: 'text-orange-500', bgColor: 'bg-orange-500/20', label: 'Mistake' },
  blunder: { icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-500/20', label: 'Blunder' },
};

export function MoveDetailPanel({ move, className }: MoveDetailPanelProps) {
  if (!move) {
    return (
      <div className={cn('p-3 sm:p-4 bg-card rounded-lg border text-center text-sm text-muted-foreground', className)}>
        Select a move to see details
      </div>
    );
  }

  const config = classificationConfig[move.classification];
  const Icon = config.icon;
  const isWhiteMove = move.ply % 2 === 1;
  const moveNumber = Math.ceil(move.ply / 2);

  return (
    <div className={cn('p-3 sm:p-4 bg-card rounded-lg border', className)}>
      {/* Move header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className={cn('p-1.5 sm:p-2 rounded-lg', config.bgColor)}>
          <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5', config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-base sm:text-lg font-bold truncate">{move.played_move_san}</span>
            <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">
              ({moveNumber}.{isWhiteMove ? '' : '..'})
            </span>
          </div>
          <Badge variant="outline" className={cn('mt-1 text-xs', config.color)}>
            {config.label}
          </Badge>
        </div>
      </div>

      {/* Best move comparison (if not best) */}
      {move.classification !== 'best' && move.best_move_san && (
        <>
          <Separator className="my-2 sm:my-3" />
          <div className="space-y-1.5 sm:space-y-2">
            <div className="text-xs sm:text-sm text-muted-foreground">Best move was:</div>
            <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-green-500/10 rounded-lg">
              <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm sm:text-base font-bold text-green-500">{move.best_move_san}</span>
            </div>
          </div>
        </>
      )}

      {/* Evaluation change */}
      <Separator className="my-2 sm:my-3" />
      <div className="space-y-1.5 sm:space-y-2">
        <div className="text-xs sm:text-sm text-muted-foreground">Evaluation</div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <EvaluationBadge evaluation={move.eval_before} />
          <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          <EvaluationBadge evaluation={move.eval_after} />
        </div>
        {move.eval_loss_cp > 0 && (
          <div className="text-xs sm:text-sm">
            <span className="text-muted-foreground">CP loss: </span>
            <span className={cn(
              'font-medium',
              move.eval_loss_cp > 300 ? 'text-red-500' :
              move.eval_loss_cp > 150 ? 'text-orange-500' :
              move.eval_loss_cp > 50 ? 'text-yellow-500' : 'text-muted-foreground'
            )}>
              {move.eval_loss_cp > 9999 ? '∞' : move.eval_loss_cp}
            </span>
          </div>
        )}
      </div>

      {/* Principal variation */}
      {move.pv && move.pv.length > 1 && (
        <>
          <Separator className="my-2 sm:my-3" />
          <div className="space-y-1.5 sm:space-y-2">
            <div className="text-xs sm:text-sm text-muted-foreground">Engine line</div>
            <div className="text-xs sm:text-sm font-mono text-muted-foreground bg-muted/50 p-1.5 sm:p-2 rounded overflow-x-auto">
              {move.pv.slice(0, 5).join(' ')}
              {move.pv.length > 5 && '...'}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
