import { describe, it, expect } from 'vitest';
import {
  getRatingModeFromTimeControl,
  BOT_DIFFICULTIES,
  TIME_CONTROLS,
} from '@/types/chess';

describe('Chess Types and Utilities', () => {
  describe('getRatingModeFromTimeControl', () => {
    it('should return bullet for very short time controls', () => {
      // 1+0 = 60 seconds total
      expect(getRatingModeFromTimeControl({ baseMs: 60000, incrementMs: 0 })).toBe('bullet');

      // 2+1 = 120 + 40*1 = 160 seconds ~ 2.67 minutes
      expect(getRatingModeFromTimeControl({ baseMs: 120000, incrementMs: 1000 })).toBe('bullet');
    });

    it('should return blitz for medium time controls', () => {
      // 3+0 = 180 seconds = 3 minutes
      expect(getRatingModeFromTimeControl({ baseMs: 180000, incrementMs: 0 })).toBe('blitz');

      // 5+0 = 300 seconds = 5 minutes
      expect(getRatingModeFromTimeControl({ baseMs: 300000, incrementMs: 0 })).toBe('blitz');

      // 5+3 = 300 + 40*3 = 420 seconds = 7 minutes
      expect(getRatingModeFromTimeControl({ baseMs: 300000, incrementMs: 3000 })).toBe('blitz');
    });

    it('should return rapid for longer time controls', () => {
      // 10+0 = 600 seconds = 10 minutes
      expect(getRatingModeFromTimeControl({ baseMs: 600000, incrementMs: 0 })).toBe('rapid');

      // 15+10 = 900 + 40*10 = 1300 seconds ~ 21.67 minutes
      expect(getRatingModeFromTimeControl({ baseMs: 900000, incrementMs: 10000 })).toBe('rapid');
    });

    it('should return classical for very long time controls', () => {
      // 30+0 = 1800 seconds = 30 minutes
      expect(getRatingModeFromTimeControl({ baseMs: 1800000, incrementMs: 0 })).toBe('classical');

      // 30+30 = 1800 + 40*30 = 3000 seconds = 50 minutes
      expect(getRatingModeFromTimeControl({ baseMs: 1800000, incrementMs: 30000 })).toBe('classical');

      // 60+0 = 60 minutes
      expect(getRatingModeFromTimeControl({ baseMs: 3600000, incrementMs: 0 })).toBe('classical');
    });

    it('should handle edge cases at boundaries', () => {
      // Exactly 3 minutes (boundary between bullet and blitz)
      expect(getRatingModeFromTimeControl({ baseMs: 180000, incrementMs: 0 })).toBe('blitz');

      // Just under 3 minutes
      expect(getRatingModeFromTimeControl({ baseMs: 179000, incrementMs: 0 })).toBe('bullet');

      // Exactly 10 minutes (boundary between blitz and rapid)
      expect(getRatingModeFromTimeControl({ baseMs: 600000, incrementMs: 0 })).toBe('rapid');

      // Exactly 30 minutes (boundary between rapid and classical)
      expect(getRatingModeFromTimeControl({ baseMs: 1800000, incrementMs: 0 })).toBe('classical');
    });
  });

  describe('BOT_DIFFICULTIES', () => {
    it('should have 5 difficulty levels', () => {
      expect(BOT_DIFFICULTIES).toHaveLength(5);
    });

    it('should have correct difficulty labels in order', () => {
      const labels = BOT_DIFFICULTIES.map(d => d.label);
      expect(labels).toEqual(['Beginner', 'Easy', 'Medium', 'Hard', 'Expert']);
    });

    it('should have increasing depth values', () => {
      for (let i = 1; i < BOT_DIFFICULTIES.length; i++) {
        expect(BOT_DIFFICULTIES[i].depth).toBeGreaterThan(BOT_DIFFICULTIES[i - 1].depth);
      }
    });

    it('should have increasing move time values', () => {
      for (let i = 1; i < BOT_DIFFICULTIES.length; i++) {
        expect(BOT_DIFFICULTIES[i].moveTimeMs).toBeGreaterThan(BOT_DIFFICULTIES[i - 1].moveTimeMs);
      }
    });

    it('should have descriptions for all difficulties', () => {
      BOT_DIFFICULTIES.forEach(difficulty => {
        expect(difficulty.description).toBeDefined();
        expect(difficulty.description.length).toBeGreaterThan(0);
      });
    });

    it('should have specific difficulty configurations', () => {
      expect(BOT_DIFFICULTIES[0]).toEqual({
        label: 'Beginner',
        depth: 2,
        moveTimeMs: 50,
        description: 'Perfect for learning',
      });

      expect(BOT_DIFFICULTIES[4]).toEqual({
        label: 'Expert',
        depth: 16,
        moveTimeMs: 800,
        description: 'Near master level',
      });
    });
  });

  describe('TIME_CONTROLS', () => {
    it('should have 10 time control presets', () => {
      expect(TIME_CONTROLS).toHaveLength(10);
    });

    it('should have correct labels and controls for bullet', () => {
      const bullet1 = TIME_CONTROLS.find(tc => tc.label === 'Bullet 1+0');
      expect(bullet1?.control).toEqual({ baseMs: 60000, incrementMs: 0 });

      const bullet2 = TIME_CONTROLS.find(tc => tc.label === 'Bullet 2+1');
      expect(bullet2?.control).toEqual({ baseMs: 120000, incrementMs: 1000 });
    });

    it('should have correct labels and controls for blitz', () => {
      const blitz3 = TIME_CONTROLS.find(tc => tc.label === 'Blitz 3+0');
      expect(blitz3?.control).toEqual({ baseMs: 180000, incrementMs: 0 });

      const blitz5 = TIME_CONTROLS.find(tc => tc.label === 'Blitz 5+0');
      expect(blitz5?.control).toEqual({ baseMs: 300000, incrementMs: 0 });

      const blitz5_3 = TIME_CONTROLS.find(tc => tc.label === 'Blitz 5+3');
      expect(blitz5_3?.control).toEqual({ baseMs: 300000, incrementMs: 3000 });
    });

    it('should have correct labels and controls for rapid', () => {
      const rapid10 = TIME_CONTROLS.find(tc => tc.label === 'Rapid 10+0');
      expect(rapid10?.control).toEqual({ baseMs: 600000, incrementMs: 0 });

      const rapid15 = TIME_CONTROLS.find(tc => tc.label === 'Rapid 15+10');
      expect(rapid15?.control).toEqual({ baseMs: 900000, incrementMs: 10000 });
    });

    it('should have correct labels and controls for classical', () => {
      const classical = TIME_CONTROLS.find(tc => tc.label === 'Classical 30+0');
      expect(classical?.control).toEqual({ baseMs: 1800000, incrementMs: 0 });
    });

    it('should have valid time values (positive)', () => {
      TIME_CONTROLS.forEach(tc => {
        expect(tc.control.baseMs).toBeGreaterThan(0);
        expect(tc.control.incrementMs).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
