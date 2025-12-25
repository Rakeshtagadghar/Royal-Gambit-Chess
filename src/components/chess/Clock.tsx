'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/stores/gameStore';

interface ClockProps {
  color: 'white' | 'black';
  className?: string;
}

export function Clock({ color, className }: ClockProps) {
  const { whiteTimeMs, blackTimeMs, boardState, status, decrementTime } = useGameStore();
  const lastTickRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const timeMs = color === 'white' ? whiteTimeMs : blackTimeMs;
  const isActive = status === 'active' && boardState.turn === (color === 'white' ? 'w' : 'b');
  const isLow = timeMs < 30000; // Less than 30 seconds
  const isCritical = timeMs < 10000; // Less than 10 seconds

  // Timer logic
  useEffect(() => {
    if (isActive && status === 'active') {
      lastTickRef.current = Date.now();
      
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const delta = now - lastTickRef.current;
        lastTickRef.current = now;
        decrementTime(color === 'white' ? 'w' : 'b', delta);
      }, 100);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, status, color, decrementTime]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const tenths = Math.floor((ms % 1000) / 100);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    if (totalSeconds < 20) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}.${tenths}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className={cn(
        'font-mono text-2xl font-bold px-4 py-2 rounded-lg transition-colors',
        isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
        isCritical && isActive && 'bg-destructive text-white animate-pulse',
        isLow && !isCritical && isActive && 'bg-accent text-accent-foreground',
        className
      )}
      animate={isCritical && isActive ? { scale: [1, 1.02, 1] } : {}}
      transition={{ repeat: Infinity, duration: 0.5 }}
    >
      {formatTime(timeMs)}
    </motion.div>
  );
}

