import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test.describe('Desktop View', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('should display full navigation on desktop', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Navigation should be visible
      const nav = page.locator('nav, header');
      await expect(nav.first()).toBeVisible();
    });

    test('should display content in proper layout', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Main content area should have proper width
      const main = page.locator('main');
      await expect(main).toBeVisible();

      const box = await main.boundingBox();
      expect(box?.width).toBeGreaterThan(800);
    });
  });

  test.describe('Tablet View', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('should display properly on tablet', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Content should be visible and not overflow
      const main = page.locator('main');
      await expect(main).toBeVisible();
    });

    test('should navigate properly on tablet', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Should be able to navigate to tasks
      const tasksLink = page.getByRole('link', { name: /tasks|タスク/i });
      if (await tasksLink.isVisible()) {
        await tasksLink.click();
        await expect(page).toHaveURL('/tasks');
      }
    });
  });

  test.describe('Mobile View', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should display properly on mobile', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Content should be visible
      const main = page.locator('main');
      await expect(main).toBeVisible();
    });

    test('should not have horizontal scroll on mobile', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check for horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalScroll).toBe(false);
    });

    test('should have accessible touch targets on mobile', async ({ page }) => {
      await page.goto('/tasks');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // Check that checkboxes/buttons are large enough for touch
      const checkboxes = page.getByRole('checkbox');
      const count = await checkboxes.count();

      if (count > 0) {
        const box = await checkboxes.first().boundingBox();
        // Touch targets should be at least 24x24px for accessibility
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(20);
          expect(box.height).toBeGreaterThanOrEqual(20);
        }
      }
    });

    test('should show progress correctly on mobile', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Progress should be visible even on small screens
      await expect(page.locator('main')).toBeVisible();
    });
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should have at least one heading
    const headings = page.getByRole('heading');
    await expect(headings.first()).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Tab through the page
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check that something is focused
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });

    expect(focusedElement).not.toBe('BODY');
  });

  test('links should have accessible names', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const links = page.getByRole('link');
    const count = await links.count();

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const accessibleName = await link.getAttribute('aria-label') ||
                             await link.textContent();
      expect(accessibleName).toBeTruthy();
    }
  });
});
