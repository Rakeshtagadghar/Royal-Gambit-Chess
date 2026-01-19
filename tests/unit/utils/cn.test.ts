import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn (className utility)', () => {
  describe('basic functionality', () => {
    it('should return empty string for no arguments', () => {
      expect(cn()).toBe('');
    });

    it('should return single class', () => {
      expect(cn('text-red-500')).toBe('text-red-500');
    });

    it('should merge multiple classes', () => {
      expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
    });

    it('should handle arrays of classes', () => {
      expect(cn(['text-red-500', 'bg-blue-500'])).toBe('text-red-500 bg-blue-500');
    });
  });

  describe('conditional classes', () => {
    it('should handle conditional objects', () => {
      expect(cn({ 'text-red-500': true, 'bg-blue-500': false })).toBe('text-red-500');
    });

    it('should handle undefined and null', () => {
      expect(cn('base', undefined, null, 'end')).toBe('base end');
    });

    it('should handle false values', () => {
      expect(cn('base', false && 'hidden', 'end')).toBe('base end');
    });

    it('should handle truthy conditions', () => {
      const isActive = true;
      expect(cn('base', isActive && 'active')).toBe('base active');
    });
  });

  describe('tailwind merge functionality', () => {
    it('should merge conflicting tailwind classes', () => {
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });

    it('should merge padding classes', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2');
    });

    it('should merge margin classes', () => {
      expect(cn('m-4', 'm-2')).toBe('m-2');
    });

    it('should handle specific padding overrides', () => {
      expect(cn('p-4', 'px-2')).toBe('p-4 px-2');
    });

    it('should handle responsive classes', () => {
      expect(cn('text-sm', 'md:text-lg', 'lg:text-xl')).toBe('text-sm md:text-lg lg:text-xl');
    });

    it('should handle flex classes', () => {
      expect(cn('flex-row', 'flex-col')).toBe('flex-col');
    });

    it('should handle width classes', () => {
      expect(cn('w-full', 'w-1/2')).toBe('w-1/2');
    });
  });

  describe('complex scenarios', () => {
    it('should handle mixed input types', () => {
      const result = cn(
        'base-class',
        ['array-class-1', 'array-class-2'],
        { 'conditional-true': true, 'conditional-false': false },
        undefined,
        'final-class'
      );
      expect(result).toContain('base-class');
      expect(result).toContain('array-class-1');
      expect(result).toContain('array-class-2');
      expect(result).toContain('conditional-true');
      expect(result).not.toContain('conditional-false');
      expect(result).toContain('final-class');
    });

    it('should handle component variants pattern', () => {
      const variant = 'primary';
      const size = 'lg';
      const disabled = false;

      const result = cn(
        'btn',
        variant === 'primary' && 'bg-blue-500 text-white',
        variant === 'secondary' && 'bg-gray-500 text-black',
        size === 'sm' && 'text-sm px-2 py-1',
        size === 'lg' && 'text-lg px-4 py-2',
        disabled && 'opacity-50 cursor-not-allowed'
      );

      expect(result).toBe('btn bg-blue-500 text-white text-lg px-4 py-2');
    });

    it('should handle state-based classes', () => {
      const isHovered = true;
      const isFocused = false;
      const isActive = true;

      const result = cn(
        'transition-colors',
        isHovered && 'hover:bg-gray-100',
        isFocused && 'ring-2 ring-blue-500',
        isActive && 'bg-blue-100'
      );

      expect(result).toBe('transition-colors hover:bg-gray-100 bg-blue-100');
    });
  });

  describe('edge cases', () => {
    it('should handle empty strings', () => {
      expect(cn('', 'text-red-500', '')).toBe('text-red-500');
    });

    it('should handle whitespace', () => {
      expect(cn('  text-red-500  ', '  bg-blue-500  ')).toBe('text-red-500 bg-blue-500');
    });

    it('should handle duplicate classes', () => {
      expect(cn('text-red-500', 'text-red-500')).toBe('text-red-500');
    });

    it('should handle deeply nested arrays', () => {
      expect(cn(['a', ['b', ['c']]])).toBe('a b c');
    });
  });
});
