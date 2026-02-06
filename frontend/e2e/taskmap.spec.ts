import { test, expect } from '@playwright/test';

test.describe('Task Map', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route('**/api/tasks/dependencies', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          nodes: [
            {
              id: 'task1',
              name: 'Debut',
              trader_id: 'prapor',
              trader_name: 'Prapor',
              min_player_level: 1,
              wiki_link: 'https://wiki.example.com/debut',
              prerequisite_task_ids: [],
            },
            {
              id: 'task2',
              name: 'Checking',
              trader_id: 'prapor',
              trader_name: 'Prapor',
              min_player_level: 2,
              wiki_link: 'https://wiki.example.com/checking',
              prerequisite_task_ids: ['task1'],
            },
            {
              id: 'task3',
              name: 'Shootout Picnic',
              trader_id: 'prapor',
              trader_name: 'Prapor',
              min_player_level: 3,
              wiki_link: null,
              prerequisite_task_ids: ['task2'],
            },
          ],
          edges: [
            { from: 'task1', to: 'task2' },
            { from: 'task2', to: 'task3' },
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
            { id: 'prapor', name: 'Prapor', image_url: null, task_count: 3 },
            { id: 'therapist', name: 'Therapist', image_url: null, task_count: 2 },
          ],
        }),
      });
    });

    await page.route('**/api/tasks', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ tasks: [] }),
      });
    });
  });

  test('should display task map page', async ({ page }) => {
    await page.goto('/taskmap');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Task Map' })).toBeVisible();
  });

  test('should display task nodes', async ({ page }) => {
    await page.goto('/taskmap');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Check that task nodes are rendered
    await expect(page.getByText('Debut')).toBeVisible();
    await expect(page.getByText('Checking')).toBeVisible();
    await expect(page.getByText('Shootout Picnic')).toBeVisible();
  });

  test('should display stats panel', async ({ page }) => {
    await page.goto('/taskmap');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Stats panel should show
    await expect(page.getByText(/Completed:/)).toBeVisible();
    await expect(page.getByText(/Available:/)).toBeVisible();
    await expect(page.getByText(/Locked:/)).toBeVisible();
    await expect(page.getByText(/Total:/)).toBeVisible();
  });

  test('should show trader filter dropdown', async ({ page }) => {
    await page.goto('/taskmap');
    await page.waitForLoadState('networkidle');

    const dropdown = page.locator('select');
    await expect(dropdown).toBeVisible();

    // Check options
    await expect(dropdown.locator('option', { hasText: 'All Traders' })).toBeVisible();
    await expect(dropdown.locator('option', { hasText: 'Prapor' })).toBeVisible();
    await expect(dropdown.locator('option', { hasText: 'Therapist' })).toBeVisible();
  });

  test('should navigate to task map from navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByRole('link', { name: 'Task Map' }).click();

    await expect(page).toHaveURL('/taskmap');
    await expect(page.getByRole('heading', { name: 'Task Map' })).toBeVisible();
  });

  test('should show task details when clicking a node', async ({ page }) => {
    await page.goto('/taskmap');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Click on a task node
    await page.getByText('Debut').click();

    // Detail panel should appear
    await expect(page.getByText('Required Level')).toBeVisible();
    await expect(page.getByText('Lv. 1')).toBeVisible();
  });

  test('should toggle task completion on double-click', async ({ page }) => {
    await page.goto('/taskmap');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Double-click on a task
    await page.getByText('Debut').dblclick();
    await page.waitForTimeout(200);

    // Check localStorage was updated
    const progressData = await page.evaluate(() =>
      localStorage.getItem('tarkov-progress')
    );
    expect(progressData).not.toBeNull();
    const parsed = JSON.parse(progressData!);
    expect(parsed.completedTaskIds).toContain('task1');
  });

  test('should have zoom controls', async ({ page }) => {
    await page.goto('/taskmap');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // React Flow controls should be visible
    const controls = page.locator('.react-flow__controls');
    await expect(controls).toBeVisible();
  });

  test('should have minimap', async ({ page }) => {
    await page.goto('/taskmap');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Minimap should be visible
    const minimap = page.locator('.react-flow__minimap');
    await expect(minimap).toBeVisible();
  });

  test('should filter by trader', async ({ page }) => {
    // Set up route that returns filtered data
    await page.route('**/api/tasks/dependencies?trader_id=prapor', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          nodes: [
            {
              id: 'task1',
              name: 'Debut',
              trader_id: 'prapor',
              trader_name: 'Prapor',
              min_player_level: 1,
              wiki_link: null,
              prerequisite_task_ids: [],
            },
          ],
          edges: [],
        }),
      });
    });

    await page.goto('/taskmap');
    await page.waitForLoadState('networkidle');

    // Select Prapor from dropdown
    await page.locator('select').selectOption('prapor');
    await page.waitForTimeout(300);

    // Should trigger filtered API call
    // (The mock will return filtered data)
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.route('**/api/tasks/dependencies', (route) => {
      route.fulfill({
        status: 500,
        body: 'Internal Server Error',
      });
    });

    await page.goto('/taskmap');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/Error/i)).toBeVisible();
  });
});

test.describe('Task Map Responsive', () => {
  test('should display on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.route('**/api/tasks/dependencies', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          nodes: [
            {
              id: 'task1',
              name: 'Debut',
              trader_id: 'prapor',
              trader_name: 'Prapor',
              min_player_level: 1,
              wiki_link: null,
              prerequisite_task_ids: [],
            },
          ],
          edges: [],
        }),
      });
    });

    await page.route('**/api/traders', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ traders: [] }),
      });
    });

    await page.goto('/taskmap');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Task Map' })).toBeVisible();
  });
});
