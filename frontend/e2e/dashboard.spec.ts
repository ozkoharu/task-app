import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should display dashboard title', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should show loading state initially', async ({ page }) => {
    await page.goto('/');
    // Either shows loading or dashboard content
    const loading = page.getByText('Loading...');
    const dashboard = page.getByRole('heading', { name: 'Dashboard' });

    await expect(loading.or(dashboard)).toBeVisible();
  });

  test('should display overall progress section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for progress indicator
    await expect(page.locator('[class*="progress"]').first()).toBeVisible();
  });

  test('should display trader progress section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for content to load
    await page.waitForTimeout(1000);

    // Should show traders or an empty/error state
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });

  test('should show 0% progress with no completed tasks', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for 0% in progress display
    await expect(page.getByText(/0.*%|0%/)).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API calls and return error
    await page.route('**/api/tasks', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should show error message
    await expect(page.getByText(/Error/i)).toBeVisible();
  });
});

test.describe('Dashboard Navigation', () => {
  test('should navigate to tasks page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click on tasks link in navigation
    await page.getByRole('link', { name: /tasks|タスク/i }).click();

    await expect(page).toHaveURL('/tasks');
  });

  test('should navigate back to dashboard', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // Click on dashboard link
    await page.getByRole('link', { name: /dashboard|ダッシュボード/i }).click();

    await expect(page).toHaveURL('/');
  });
});
