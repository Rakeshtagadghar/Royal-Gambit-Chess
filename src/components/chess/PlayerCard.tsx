'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Clock } from './Clock';
import { CapturedPieces } from './CapturedPieces';
import { useGameStore } from '@/stores/gameStore';
import { Wifi, WifiOff, Bot } from 'lucide-react';

interface PlayerCardProps {
  color: 'white' | 'black';
  username: string;
  displayName?: string;
  avatarUrl?: string;
  rating?: number;
  isBot?: boolean;
  isOnline?: boolean;
  className?: string;
}

export function PlayerCard({
  color,
  username,
  displayName,
  avatarUrl,
  rating,
  isBot = false,
  isOnline = true,
  className,
}: PlayerCardProps) {
  const { boardState, status } = useGameStore();
  const isActive = status === 'active' && boardState.turn === (color === 'white' ? 'w' : 'b');

  return (
    <motion.div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg bg-card transition-colors',
        isActive && 'ring-2 ring-primary',
        className
      )}
      animate={isActive ? { boxShadow: '0 0 10px var(--primary)' } : {}}
    >
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarImage src={avatarUrl} alt={username} />
          <AvatarFallback className={cn(
            'text-lg font-bold',
            color === 'white' ? 'bg-gray-100 text-gray-900' : 'bg-gray-900 text-gray-100'
          )}>
            {isBot ? <Bot className="h-6 w-6" /> : username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {!isBot && (
          <span className={cn(
            'absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card flex items-center justify-center',
            isOnline ? 'bg-green-500' : 'bg-gray-500'
          )}>
            {isOnline ? (
              <Wifi className="h-2 w-2 text-white" />
            ) : (
              <WifiOff className="h-2 w-2 text-white" />
            )}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold truncate">
            {displayName || username}
          </span>
          {isBot && (
            <Badge variant="secondary" className="text-xs">
              Bot
            </Badge>
          )}
        </div>
        {rating && (
          <span className="text-sm text-muted-foreground">
            {rating} ELO
          </span>
        )}
        <CapturedPieces color={color} className="mt-1" />
      </div>

      <Clock color={color} />
    </motion.div>
  );
}

