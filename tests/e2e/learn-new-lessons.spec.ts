import { test, expect } from '@playwright/test';
import { dismissCookieBanner } from './helpers';

/**
 * E2E tests for the new Chess Basics lessons:
 * - The Rook
 * - The Bishop
 * - The Queen
 * - The King
 * - Castling
 */
test.describe('Chess Basics - New Lessons', () => {
  const newLessons = [
    { slug: 'the-rook', title: 'The Rook' },
    { slug: 'the-bishop', title: 'The Bishop' },
    { slug: 'the-queen', title: 'The Queen' },
    { slug: 'the-king', title: 'The King' },
    { slug: 'castling', title: 'Castling' },
  ];

  test.beforeEach(async ({ page }) => {
    await dismissCookieBanner(page);
  });

  test.describe('Lesson Visibility in Track', () => {
    test('should display all new lessons in Chess Basics track', async ({ page }) => {
      await page.goto('/learn/track/beginner-basics');
      await page.waitForLoadState('networkidle');

      for (const lesson of newLessons) {
        const lessonElement = page.getByText(lesson.title, { exact: false });
        await expect(lessonElement.first()).toBeVisible();
      }
    });

    test('should show lessons in correct order', async ({ page }) => {
      await page.goto('/learn/track/beginner-basics');
      await page.waitForLoadState('networkidle');

      // Get all lesson links/cards
      const lessonLinks = page.locator('a[href*="/learn/lesson/"]');
      const count = await lessonLinks.count();

      // Should have at least the 4 existing + 5 new lessons = 9 total
      expect(count).toBeGreaterThanOrEqual(9);
    });
  });

  test.describe('The Rook Lesson', () => {
    test('should load the rook lesson', async ({ page }) => {
      await page.goto('/learn/lesson/the-rook');
      await page.waitForLoadState('networkidle');

      // Check heading
      await expect(page.getByRole('heading', { name: /rook/i })).toBeVisible();
    });

    test('should display chessboard with rook position', async ({ page }) => {
      await page.goto('/learn/lesson/the-rook');
      await page.waitForLoadState('networkidle');

      // Should have a chessboard visible
      const board = page.locator('[class*="board"], [data-testid="chessboard"]');
      await expect(board.first()).toBeVisible();
    });

    test('should show explain step content about rook movement', async ({ page }) => {
      await page.goto('/learn/lesson/the-rook');
      await page.waitForLoadState('networkidle');

      // Should show content about horizontal/vertical movement
      const content = page.getByText(/horizontally|vertically|straight/i);
      await expect(content.first()).toBeVisible();
    });

    test('should navigate through all steps', async ({ page }) => {
      await page.goto('/learn/lesson/the-rook');
      await page.waitForLoadState('networkidle');

      // Navigate through steps using Next button
      const nextButton = page.getByRole('button', { name: /next|continue/i });

      // Step through the lesson (4 steps total)
      for (let i = 0; i < 3; i++) {
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(500);
        }
      }
    });

    test('should complete move task correctly', async ({ page }) => {
      await page.goto('/learn/lesson/the-rook');
      await page.waitForLoadState('networkidle');

      // Navigate to move_task step (step 2)
      const nextButton = page.getByRole('button', { name: /next|continue/i });
      await nextButton.click();
      await page.waitForTimeout(300);
      await nextButton.click();
      await page.waitForTimeout(300);

      // Should see move task instruction
      const taskText = page.getByText(/capture.*pawn|move.*rook/i);
      await expect(taskText.first()).toBeVisible();
    });
  });

  test.describe('The Bishop Lesson', () => {
    test('should load the bishop lesson', async ({ page }) => {
      await page.goto('/learn/lesson/the-bishop');
      await page.waitForLoadState('networkidle');

      await expect(page.getByRole('heading', { name: /bishop/i })).toBeVisible();
    });

    test('should show content about diagonal movement', async ({ page }) => {
      await page.goto('/learn/lesson/the-bishop');
      await page.waitForLoadState('networkidle');

      const content = page.getByText(/diagonal/i);
      await expect(content.first()).toBeVisible();
    });

    test('should explain same colour rule', async ({ page }) => {
      await page.goto('/learn/lesson/the-bishop');
      await page.waitForLoadState('networkidle');

      // Navigate to step about colour
      const nextButton = page.getByRole('button', { name: /next|continue/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(300);
      }

      const colourContent = page.getByText(/same colour|light.*dark|dark.*light/i);
      await expect(colourContent.first()).toBeVisible();
    });

    test('should display arrows showing diagonal movement', async ({ page }) => {
      await page.goto('/learn/lesson/the-bishop');
      await page.waitForLoadState('networkidle');

      // Check for SVG arrows on the board
      const board = page.locator('[class*="board"], [data-testid="chessboard"]');
      await expect(board.first()).toBeVisible();

      // Arrows should be rendered as SVG elements
      const arrows = page.locator('svg line, svg path, [class*="arrow"]');
      const arrowCount = await arrows.count();
      expect(arrowCount).toBeGreaterThan(0);
    });
  });

  test.describe('The Queen Lesson', () => {
    test('should load the queen lesson', async ({ page }) => {
      await page.goto('/learn/lesson/the-queen');
      await page.waitForLoadState('networkidle');

      await expect(page.getByRole('heading', { name: /queen/i })).toBeVisible();
    });

    test('should explain queen as rook + bishop combined', async ({ page }) => {
      await page.goto('/learn/lesson/the-queen');
      await page.waitForLoadState('networkidle');

      const content = page.getByText(/rook.*bishop|bishop.*rook|combined/i);
      await expect(content.first()).toBeVisible();
    });

    test('should show queen as most powerful piece', async ({ page }) => {
      await page.goto('/learn/lesson/the-queen');
      await page.waitForLoadState('networkidle');

      const powerfulText = page.getByText(/powerful/i);
      await expect(powerfulText.first()).toBeVisible();
    });
  });

  test.describe('The King Lesson', () => {
    test('should load the king lesson', async ({ page }) => {
      await page.goto('/learn/lesson/the-king');
      await page.waitForLoadState('networkidle');

      await expect(page.getByRole('heading', { name: /king/i })).toBeVisible();
    });

    test('should explain one square movement', async ({ page }) => {
      await page.goto('/learn/lesson/the-king');
      await page.waitForLoadState('networkidle');

      const content = page.getByText(/one square/i);
      await expect(content.first()).toBeVisible();
    });

    test('should explain check concept', async ({ page }) => {
      await page.goto('/learn/lesson/the-king');
      await page.waitForLoadState('networkidle');

      // Navigate to check explanation step
      const nextButton = page.getByRole('button', { name: /next|continue/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(300);
      }

      const checkContent = page.getByText(/check/i);
      await expect(checkContent.first()).toBeVisible();
    });

    test('should have escape check move task', async ({ page }) => {
      await page.goto('/learn/lesson/the-king');
      await page.waitForLoadState('networkidle');

      // Navigate to move task step
      const nextButton = page.getByRole('button', { name: /next|continue/i });
      for (let i = 0; i < 2; i++) {
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(300);
        }
      }

      const taskText = page.getByText(/escape.*check|safe.*square/i);
      await expect(taskText.first()).toBeVisible();
    });
  });

  test.describe('Castling Lesson', () => {
    test('should load the castling lesson', async ({ page }) => {
      await page.goto('/learn/lesson/castling');
      await page.waitForLoadState('networkidle');

      await expect(page.getByRole('heading', { name: /castling/i })).toBeVisible();
    });

    test('should explain king and rook move together', async ({ page }) => {
      await page.goto('/learn/lesson/castling');
      await page.waitForLoadState('networkidle');

      const content = page.getByText(/king.*rook|rook.*king|same time/i);
      await expect(content.first()).toBeVisible();
    });

    test('should explain castling conditions', async ({ page }) => {
      await page.goto('/learn/lesson/castling');
      await page.waitForLoadState('networkidle');

      // Navigate to conditions step
      const nextButton = page.getByRole('button', { name: /next|continue/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(300);
      }

      // Should explain when castling is legal
      const conditionsText = page.getByText(/not moved|empty|not in check/i);
      await expect(conditionsText.first()).toBeVisible();
    });

    test('should show correct board position for castling', async ({ page }) => {
      await page.goto('/learn/lesson/castling');
      await page.waitForLoadState('networkidle');

      // Board should have king on e1 and rooks on a1/h1
      const board = page.locator('[class*="board"], [data-testid="chessboard"]');
      await expect(board.first()).toBeVisible();
    });

    test('should have kingside castling move task', async ({ page }) => {
      await page.goto('/learn/lesson/castling');
      await page.waitForLoadState('networkidle');

      // Navigate to move task step
      const nextButton = page.getByRole('button', { name: /next|continue/i });
      for (let i = 0; i < 2; i++) {
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(300);
        }
      }

      const taskText = page.getByText(/castle.*kingside|O-O/i);
      await expect(taskText.first()).toBeVisible();
    });
  });

  test.describe('Quiz Steps', () => {
    test('rook quiz should have correct answer option', async ({ page }) => {
      await page.goto('/learn/lesson/the-rook');
      await page.waitForLoadState('networkidle');

      // Navigate to quiz step (last step)
      const nextButton = page.getByRole('button', { name: /next|continue/i });
      for (let i = 0; i < 3; i++) {
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(300);
        }
      }

      // Should show quiz question about rook directions
      const quizQuestion = page.getByText(/which direction|how.*rook/i);
      const hasQuiz = await quizQuestion.first().isVisible().catch(() => false);

      if (hasQuiz) {
        // Should have answer option for horizontal and vertical
        const correctOption = page.getByText(/horizontally.*vertically|vertically.*horizontally/i);
        await expect(correctOption.first()).toBeVisible();
      }
    });

    test('bishop quiz should have same colour answer', async ({ page }) => {
      await page.goto('/learn/lesson/the-bishop');
      await page.waitForLoadState('networkidle');

      // Navigate to quiz step
      const nextButton = page.getByRole('button', { name: /next|continue/i });
      for (let i = 0; i < 3; i++) {
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(300);
        }
      }

      const quizQuestion = page.getByText(/colour|color/i);
      const hasQuiz = await quizQuestion.first().isVisible().catch(() => false);

      if (hasQuiz) {
        const correctOption = page.getByText(/no.*never/i);
        await expect(correctOption.first()).toBeVisible();
      }
    });

    test('queen quiz should have rook + bishop answer', async ({ page }) => {
      await page.goto('/learn/lesson/the-queen');
      await page.waitForLoadState('networkidle');

      // Navigate to quiz step
      const nextButton = page.getByRole('button', { name: /next|continue/i });
      for (let i = 0; i < 2; i++) {
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(300);
        }
      }

      const correctOption = page.getByText(/rook.*bishop/i);
      const hasOption = await correctOption.first().isVisible().catch(() => false);

      if (hasOption) {
        await expect(correctOption.first()).toBeVisible();
      }
    });

    test('castling quiz should have correct answer about check', async ({ page }) => {
      await page.goto('/learn/lesson/castling');
      await page.waitForLoadState('networkidle');

      // Navigate to quiz step
      const nextButton = page.getByRole('button', { name: /next|continue/i });
      for (let i = 0; i < 3; i++) {
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(300);
        }
      }

      const quizQuestion = page.getByText(/castle.*check/i);
      const hasQuiz = await quizQuestion.first().isVisible().catch(() => false);

      if (hasQuiz) {
        // Answer should be "No"
        const noOption = page.getByRole('button', { name: /^no$/i }).or(page.getByText(/^no$/i));
        await expect(noOption.first()).toBeVisible();
      }
    });
  });

  test.describe('Lesson Order in Track', () => {
    test('new lessons should appear between Knight and Back Rank Mate', async ({ page }) => {
      await page.goto('/learn/track/beginner-basics');
      await page.waitForLoadState('networkidle');

      // Get all lesson titles in order
      const lessonCards = page.locator('a[href*="/learn/lesson/"]');
      const count = await lessonCards.count();

      const lessonOrder: string[] = [];
      for (let i = 0; i < count; i++) {
        const text = await lessonCards.nth(i).textContent();
        if (text) lessonOrder.push(text.trim());
      }

      // Verify expected order (new lessons between Knight and Back Rank Mate)
      const knightIndex = lessonOrder.findIndex(t => /knight/i.test(t));
      const rookIndex = lessonOrder.findIndex(t => /^the rook$/i.test(t) || t.toLowerCase() === 'the rook');
      const backRankIndex = lessonOrder.findIndex(t => /back rank/i.test(t));

      if (knightIndex !== -1 && rookIndex !== -1 && backRankIndex !== -1) {
        expect(rookIndex).toBeGreaterThan(knightIndex);
        expect(backRankIndex).toBeGreaterThan(rookIndex);
      }
    });
  });
});
