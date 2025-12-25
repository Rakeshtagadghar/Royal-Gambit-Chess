'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

type ConfettiPiece = {
  id: number;
  leftPct: number;
  size: number;
  rotate: number;
  delay: number;
  duration: number;
  color: string;
  drift: number;
};

const COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4', '#eab308'];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

/**
 * Continuous confetti overlay while `active` is true.
 * Disappears automatically when the page unmounts (e.g. user navigates away via navbar).
 */
export function ConfettiRain({ active }: { active: boolean }) {
  const pieces = useMemo<ConfettiPiece[]>(() => {
    return Array.from({ length: 64 }).map((_, idx) => ({
      id: idx,
      leftPct: rand(0, 100),
      size: rand(6, 12),
      rotate: rand(0, 360),
      delay: rand(0, 1.5),
      duration: rand(2.4, 4.2),
      color: COLORS[Math.floor(rand(0, COLORS.length))]!,
      drift: rand(-160, 160),
    }));
  }, []);

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-[-20px] rounded-sm"
          style={{
            left: `${p.leftPct}%`,
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
            backgroundColor: p.color,
          }}
          initial={{ y: -20, x: 0, rotate: p.rotate, opacity: 0 }}
          animate={{
            y: ['-10vh', '110vh'],
            x: [0, p.drift],
            rotate: [p.rotate, p.rotate + rand(360, 900)],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            delay: p.delay,
            duration: p.duration,
            repeat: Infinity,
            repeatDelay: rand(0.2, 0.9),
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}


