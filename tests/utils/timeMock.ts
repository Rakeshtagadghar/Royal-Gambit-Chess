import { vi, beforeEach, afterEach } from 'vitest';

/**
 * Time mocking utilities for testing time-dependent code
 */

// Freeze Date.now() at a specific time
export function freezeTime(timestamp: number | Date = Date.now()): void {
  const frozenTime = typeof timestamp === 'number' ? timestamp : timestamp.getTime();
  vi.useFakeTimers();
  vi.setSystemTime(frozenTime);
}

// Unfreeze time and restore real timers
export function unfreezeTime(): void {
  vi.useRealTimers();
}

// Advance time by a specific amount
export function advanceTimeBy(ms: number): void {
  vi.advanceTimersByTime(ms);
}

// Advance time to the next timer
export function advanceToNextTimer(): void {
  vi.advanceTimersToNextTimer();
}

// Run all pending timers
export function runAllTimers(): void {
  vi.runAllTimers();
}

// Run only pending timers (not timers created during execution)
export function runOnlyPendingTimers(): void {
  vi.runOnlyPendingTimers();
}

/**
 * Hook for freezing time in a test suite
 * Usage:
 *   describe('My tests', () => {
 *     useFreezedTime(new Date('2024-01-01'));
 *     // All tests will have frozen time
 *   });
 */
export function useFreezedTime(timestamp: number | Date = new Date('2024-01-01T00:00:00Z')): void {
  beforeEach(() => {
    freezeTime(timestamp);
  });

  afterEach(() => {
    unfreezeTime();
  });
}

/**
 * Create a clock simulator for testing game clocks
 */
export function createClockSimulator(initialTimeMs: number = 300000) {
  let currentTime = initialTimeMs;
  let isRunning = false;
  let lastTick = Date.now();
  const callbacks: Array<(remainingTime: number) => void> = [];

  return {
    get currentTime() {
      return currentTime;
    },
    get isRunning() {
      return isRunning;
    },
    start() {
      isRunning = true;
      lastTick = Date.now();
    },
    stop() {
      if (isRunning) {
        currentTime = Math.max(0, currentTime - (Date.now() - lastTick));
      }
      isRunning = false;
    },
    tick(deltaMs: number) {
      if (isRunning) {
        currentTime = Math.max(0, currentTime - deltaMs);
        callbacks.forEach(cb => cb(currentTime));
      }
      return currentTime;
    },
    addTime(incrementMs: number) {
      currentTime += incrementMs;
    },
    setTime(timeMs: number) {
      currentTime = timeMs;
    },
    onTick(callback: (remainingTime: number) => void) {
      callbacks.push(callback);
      return () => {
        const index = callbacks.indexOf(callback);
        if (index > -1) callbacks.splice(index, 1);
      };
    },
    isTimeout() {
      return currentTime <= 0;
    },
    reset(timeMs: number = initialTimeMs) {
      currentTime = timeMs;
      isRunning = false;
    },
  };
}

/**
 * Format time for display (useful in assertions)
 */
export function formatTimeMs(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
