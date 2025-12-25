'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

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

export function ConfettiBurst({ trigger }: { trigger: boolean }) {
  const [visible, setVisible] = useState(false);

  // Generate once per mount for a stable animation.
  const pieces = useMemo<ConfettiPiece[]>(() => {
    return Array.from({ length: 56 }).map((_, idx) => ({
      id: idx,
      leftPct: rand(0, 100),
      size: rand(6, 12),
      rotate: rand(0, 360),
      delay: rand(0, 0.25),
      duration: rand(1.6, 2.4),
      color: COLORS[Math.floor(rand(0, COLORS.length))]!,
      drift: rand(-140, 140),
    }));
  }, []);

  useEffect(() => {
    if (!trigger) return;
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 2600);
    return () => window.clearTimeout(t);
  }, [trigger]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
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
              initial={{
                y: -20,
                x: 0,
                rotate: p.rotate,
                opacity: 0,
              }}
              animate={{
                y: [0, rand(420, 920)],
                x: [0, p.drift],
                rotate: [p.rotate, p.rotate + rand(360, 900)],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                delay: p.delay,
                duration: p.duration,
                ease: 'easeOut',
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}


