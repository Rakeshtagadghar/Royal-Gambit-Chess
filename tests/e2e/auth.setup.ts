import { test as setup, Page } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const authFile = path.join(__dirname, '.auth/user.json');

// Ensure auth directory exists
const authDir = path.join(__dirname, '.auth');
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

// Helper to dismiss cookie banner
async function dismissCookieBanner(page: Page) {
  const acceptCookies = page.getByRole('button', { name: /accept all/i });
  try {
    await acceptCookies.click({ timeout: 3000 });
    await page.waitForTimeout(500);
  } catch {
    // Cookie banner might not be present or already dismissed
  }
}

// Helper to login
async function performLogin(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Dismiss cookie banner first - it may be blocking other elements
  await dismissCookieBanner(page);

  // Click on Sign In tab - use force:true if needed to bypass any overlay issues
  const signInTab = page.getByRole('tab', { name: 'Sign In' });
  await signInTab.click({ force: true });
  await page.waitForTimeout(500);

  // Now fill the sign-in form
  // The Sign In tab panel should have only one email and one password field
  const emailInput = page.getByLabel('Email');
  const passwordInput = page.getByLabel('Password');

  await emailInput.fill(email);
  await passwordInput.fill(password);

  // Click the Sign In button
  await page.getByRole('button', { name: 'Sign In' }).click();
}

setup('authenticate', async ({ page }) => {
  const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
  const testPassword = process.env.TEST_USER_PASSWORD || 'testpassword123';

  await performLogin(page, testEmail, testPassword);

  // Wait for redirect or error
  try {
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });
    // Login succeeded - save state
    console.log('Auth setup: Login succeeded');
  } catch {
    // Login failed (user doesn't exist or wrong password)
    console.log('Auth setup: Login failed, tests will run in unauthenticated mode');
  }

  await page.context().storageState({ path: authFile });
});

// Setup for a second user (for multiplayer testing) - optional
setup('authenticate playerB', async ({ page }) => {
  const playerBAuthFile = path.join(__dirname, '.auth/playerB.json');

  try {
    const testEmail = process.env.TEST_PLAYER_B_EMAIL || 'playerb@example.com';
    const testPassword = process.env.TEST_PLAYER_B_PASSWORD || 'testpassword123';

    await performLogin(page, testEmail, testPassword);

    try {
      await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });
    } catch {
      // Login failed - continue anyway
    }
  } catch (e) {
    console.log('PlayerB auth setup failed:', e);
  }

  await page.context().storageState({ path: playerBAuthFile });
});

// Setup for spectator user - optional
setup('authenticate spectator', async ({ page }) => {
  const spectatorAuthFile = path.join(__dirname, '.auth/spectator.json');

  try {
    const testEmail = process.env.TEST_SPECTATOR_EMAIL || 'spectator@example.com';
    const testPassword = process.env.TEST_SPECTATOR_PASSWORD || 'testpassword123';

    await performLogin(page, testEmail, testPassword);

    try {
      await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });
    } catch {
      // Login failed - continue anyway
    }
  } catch (e) {
    console.log('Spectator auth setup failed:', e);
  }

  await page.context().storageState({ path: spectatorAuthFile });
});
