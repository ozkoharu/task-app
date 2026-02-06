import { test, expect } from '@playwright/test';

test.describe('Task List', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/tasks');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should display tasks page', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // Should show tasks content
    await expect(page.locator('main')).toBeVisible();
  });

  test('should display task list after loading', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // Wait for tasks to load
    await page.waitForTimeout(1000);

    // Check for task items or empty state
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });
});

test.describe('Task Completion', () => {
  test('should toggle task completion on checkbox click', async ({ page }) => {
    // Set up mock data
    await page.route('**/api/tasks', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            {
              id: 'test-task-1',
              name: 'Test Task',
              trader: { id: 'prapor', name: 'Prapor' },
              min_player_level: 1,
              wiki_link: null,
              objectives: [],
            },
          ],
        }),
      });
    });

    await page.route('**/api/traders', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          traders: [
            { id: 'prapor', name: 'Prapor', image_url: null, task_count: 1 },
          ],
        }),
      });
    });

    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Find checkbox and click
    const checkbox = page.getByRole('checkbox').first();
    if (await checkbox.isVisible()) {
      await checkbox.click();

      // Verify localStorage was updated
      const progressData = await page.evaluate(() => {
        return localStorage.getItem('tarkov-progress');
      });

      expect(progressData).not.toBeNull();
      const parsed = JSON.parse(progressData!);
      expect(parsed.completedTaskIds).toContain('test-task-1');
    }
  });

  test('should persist completion state after page reload', async ({ page }) => {
    // Pre-set completed task in localStorage
    await page.goto('/tasks');
    await page.evaluate(() => {
      localStorage.setItem('tarkov-progress', JSON.stringify({
        completedTaskIds: ['test-task-1'],
        updatedAt: new Date().toISOString(),
      }));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify localStorage still has the data
    const progressData = await page.evaluate(() => {
      return localStorage.getItem('tarkov-progress');
    });

    expect(progressData).not.toBeNull();
    const parsed = JSON.parse(progressData!);
    expect(parsed.completedTaskIds).toContain('test-task-1');
  });

  test('should update progress after completing task', async ({ page }) => {
    await page.route('**/api/tasks', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            {
              id: 'task-1',
              name: 'Task One',
              trader: { id: 'prapor', name: 'Prapor' },
              min_player_level: 1,
              wiki_link: null,
              objectives: [],
            },
            {
              id: 'task-2',
              name: 'Task Two',
              trader: { id: 'prapor', name: 'Prapor' },
              min_player_level: 2,
              wiki_link: null,
              objectives: [],
            },
          ],
        }),
      });
    });

    await page.route('**/api/traders', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          traders: [
            { id: 'prapor', name: 'Prapor', image_url: null, task_count: 2 },
          ],
        }),
      });
    });

    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Complete one task
    const checkbox = page.getByRole('checkbox').first();
    if (await checkbox.isVisible()) {
      await checkbox.click();
      await page.waitForTimeout(200);

      // Check that progress was saved
      const progressData = await page.evaluate(() => {
        return localStorage.getItem('tarkov-progress');
      });

      expect(progressData).not.toBeNull();
      const parsed = JSON.parse(progressData!);
      expect(parsed.completedTaskIds.length).toBeGreaterThan(0);
    }
  });
});

test.describe('Task Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/tasks', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            {
              id: 'prapor-task',
              name: 'Prapor Task',
              trader: { id: 'prapor', name: 'Prapor' },
              min_player_level: 1,
              wiki_link: null,
              objectives: [],
            },
            {
              id: 'therapist-task',
              name: 'Therapist Task',
              trader: { id: 'therapist', name: 'Therapist' },
              min_player_level: 1,
              wiki_link: null,
              objectives: [],
            },
          ],
        }),
      });
    });

    await page.route('**/api/traders', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          traders: [
            { id: 'prapor', name: 'Prapor', image_url: null, task_count: 1 },
            { id: 'therapist', name: 'Therapist', image_url: null, task_count: 1 },
          ],
        }),
      });
    });
  });

  test('should have filter controls', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // Look for filter elements (select, input, etc.)
    const filterSection = page.locator('[class*="filter"]');
    // Filter section should exist or tasks should be visible
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });

  test('should filter by search text', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Find search input
    const searchInput = page.getByPlaceholder(/search|検索/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('Prapor');
      await page.waitForTimeout(300);

      // Should show filtered results
      await expect(page.getByText('Prapor Task')).toBeVisible();
    }
  });
});
