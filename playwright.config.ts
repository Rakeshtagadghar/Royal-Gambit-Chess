import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true, // Run tests sequentially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 10, // Single worker for step-by-step execution
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'playwright-results.xml' }],
    ['list'],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Setup project for authentication
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(__dirname, 'tests/e2e/.auth/user.json'),
      },
      dependencies: ['setup'],
    },
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        storageState: path.join(__dirname, 'tests/e2e/.auth/user.json'),
      },
      dependencies: ['setup'],
    },
  ],
  webServer: process.env.CI
    ? undefined
    : {
        command: 'pnpm dev:test',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120000,
      },
  outputDir: './tests/e2e/test-results',
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
});
