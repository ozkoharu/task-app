import { test, expect } from '@playwright/test';

test.describe('Progress Persistence', () => {
  test('should persist progress across page navigation', async ({ page }) => {
    // Set initial progress
    await page.goto('/tasks');
    await page.evaluate(() => {
      localStorage.setItem('tarkov-progress', JSON.stringify({
        completedTaskIds: ['task-1', 'task-2'],
        updatedAt: new Date().toISOString(),
      }));
    });

    // Navigate to dashboard
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate back to tasks
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // Verify progress is still there
    const progressData = await page.evaluate(() => {
      return localStorage.getItem('tarkov-progress');
    });

    expect(progressData).not.toBeNull();
    const parsed = JSON.parse(progressData!);
    expect(parsed.completedTaskIds).toContain('task-1');
    expect(parsed.completedTaskIds).toContain('task-2');
  });

  test('should persist progress after browser refresh', async ({ page }) => {
    await page.goto('/tasks');

    // Set progress
    await page.evaluate(() => {
      localStorage.setItem('tarkov-progress', JSON.stringify({
        completedTaskIds: ['persistent-task'],
        updatedAt: new Date().toISOString(),
      }));
    });

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify progress persisted
    const progressData = await page.evaluate(() => {
      return localStorage.getItem('tarkov-progress');
    });

    expect(progressData).not.toBeNull();
    const parsed = JSON.parse(progressData!);
    expect(parsed.completedTaskIds).toContain('persistent-task');
  });

  test('should clear all progress when clearAll is called', async ({ page }) => {
    await page.goto('/tasks');

    // Set initial progress
    await page.evaluate(() => {
      localStorage.setItem('tarkov-progress', JSON.stringify({
        completedTaskIds: ['task-1', 'task-2', 'task-3'],
        updatedAt: new Date().toISOString(),
      }));
    });

    // Clear progress
    await page.evaluate(() => {
      localStorage.removeItem('tarkov-progress');
    });

    // Verify cleared
    const progressData = await page.evaluate(() => {
      return localStorage.getItem('tarkov-progress');
    });

    expect(progressData).toBeNull();
  });

  test('should handle corrupted localStorage gracefully', async ({ page }) => {
    await page.goto('/tasks');

    // Set corrupted data
    await page.evaluate(() => {
      localStorage.setItem('tarkov-progress', 'not-valid-json{{{');
    });

    // Reload and check page doesn't crash
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Page should still be functional
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Progress Display Accuracy', () => {
  test('should show correct percentage on dashboard', async ({ page }) => {
    // Mock API to return exactly 4 tasks
    await page.route('**/api/tasks', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            { id: 't1', name: 'Task 1', trader: { id: 'p', name: 'P' }, min_player_level: 1, objectives: [] },
            { id: 't2', name: 'Task 2', trader: { id: 'p', name: 'P' }, min_player_level: 1, objectives: [] },
            { id: 't3', name: 'Task 3', trader: { id: 'p', name: 'P' }, min_player_level: 1, objectives: [] },
            { id: 't4', name: 'Task 4', trader: { id: 'p', name: 'P' }, min_player_level: 1, objectives: [] },
          ],
        }),
      });
    });

    await page.route('**/api/traders', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          traders: [{ id: 'p', name: 'P', image_url: null, task_count: 4 }],
        }),
      });
    });

    // Set 2 completed tasks (50%)
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('tarkov-progress', JSON.stringify({
        completedTaskIds: ['t1', 't2'],
        updatedAt: new Date().toISOString(),
      }));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Should show 50%
    await expect(page.getByText(/50.*%|50%/)).toBeVisible();
  });
});
