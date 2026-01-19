import { Page } from '@playwright/test';

/**
 * Dismisses the cookie consent banner if present
 */
export async function dismissCookieBanner(page: Page) {
  const acceptCookies = page.getByRole('button', { name: /accept all/i });
  try {
    await acceptCookies.click({ timeout: 2000 });
    await page.waitForTimeout(500);
  } catch {
    // Cookie banner not present or already dismissed
  }
}
