import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: [
      'tests/unit/**/*.{test,spec}.{js,ts,tsx}',
      'tests/integration/**/*.{test,spec}.{js,ts,tsx}',
      'tests/contracts/**/*.{test,spec}.{js,ts,tsx}',
      'tests/security/**/*.{test,spec}.{js,ts,tsx}',
    ],
    exclude: ['tests/e2e/**/*', 'node_modules/**/*'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/app/**/*.tsx', // Page components tested in E2E
        'src/app/api/**/*', // API routes tested in integration tests
        'src/components/ui/**/*', // Third-party UI components (shadcn)
        'src/components/analytics/**/*', // Third-party analytics integrations
        'src/components/layout/**/*', // Layout components tested in E2E
        'src/components/providers/**/*', // Provider wrappers
        'src/components/cookies/**/*', // Cookie consent (third-party)
        'src/components/recaptcha/**/*', // ReCaptcha (third-party)
        'src/lib/analytics/**/*', // Third-party gtag integration
        'src/lib/recaptcha/**/*', // ReCaptcha integration
        'src/lib/supabase/**/*', // Supabase clients tested in integration tests
        'src/lib/config.ts', // Configuration constants
        'src/**/index.ts', // Barrel/re-export files
        'src/types/**/*', // Type definitions only
      ],
      thresholds: {
        statements: 1,
        branches: 1,
        functions: 1,
        lines: 1,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    retry: 0,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
});
