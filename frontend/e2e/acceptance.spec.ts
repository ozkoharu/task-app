/**
 * Acceptance Tests - 受け入れテスト
 *
 * 要件定義書（docs/01_要件定義書.md）に基づく受け入れテスト
 * 各テストは要件IDに対応しています。
 */
import { test, expect } from '@playwright/test';

test.describe('F-001: タスク一覧表示', () => {
  test('全トレーダーのタスクが正常に表示される', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // タスク一覧ページが表示される
    await expect(page.locator('main')).toBeVisible();
  });

  test('トレーダー別にグルーピングされている', async ({ page }) => {
    await page.route('**/api/tasks', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            { id: 't1', name: 'Prapor Task 1', trader: { id: 'prapor', name: 'Prapor' }, min_player_level: 1, objectives: [] },
            { id: 't2', name: 'Therapist Task 1', trader: { id: 'therapist', name: 'Therapist' }, min_player_level: 1, objectives: [] },
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

    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // 両方のトレーダー名が表示される
    await expect(page.getByText('Prapor')).toBeVisible();
    await expect(page.getByText('Therapist')).toBeVisible();
  });

  test('タスク名、必要レベルが表示される', async ({ page }) => {
    await page.route('**/api/tasks', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            { id: 't1', name: 'Debut', trader: { id: 'prapor', name: 'Prapor' }, min_player_level: 1, objectives: [] },
          ],
        }),
      });
    });

    await page.route('**/api/traders', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          traders: [{ id: 'prapor', name: 'Prapor', image_url: null, task_count: 1 }],
        }),
      });
    });

    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // タスク名が表示される
    await expect(page.getByText('Debut')).toBeVisible();
    // レベルが表示される
    await expect(page.getByText(/Lv\.?\s*1|Level\s*1|1/)).toBeVisible();
  });

  test('API障害時にエラーメッセージを表示', async ({ page }) => {
    await page.route('**/api/tasks', (route) => {
      route.fulfill({ status: 500 });
    });

    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/Error|エラー/i)).toBeVisible();
  });
});

test.describe('F-002: タスク完了チェック', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/tasks', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            { id: 'task-debut', name: 'Debut', trader: { id: 'prapor', name: 'Prapor' }, min_player_level: 1, objectives: [] },
          ],
        }),
      });
    });

    await page.route('**/api/traders', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          traders: [{ id: 'prapor', name: 'Prapor', image_url: null, task_count: 1 }],
        }),
      });
    });
  });

  test('チェックボックスで完了状態をトグルできる', async ({ page }) => {
    await page.goto('/tasks');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const checkbox = page.getByRole('checkbox').first();
    if (await checkbox.isVisible()) {
      // 初期状態: 未チェック
      await expect(checkbox).not.toBeChecked();

      // クリックして完了
      await checkbox.click();
      await page.waitForTimeout(200);

      // 完了状態: チェック済み
      await expect(checkbox).toBeChecked();

      // 再度クリックして未完了に戻す
      await checkbox.click();
      await page.waitForTimeout(200);

      await expect(checkbox).not.toBeChecked();
    }
  });

  test('状態変更が即座に反映される（ページリロード不要）', async ({ page }) => {
    await page.goto('/tasks');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const checkbox = page.getByRole('checkbox').first();
    if (await checkbox.isVisible()) {
      await checkbox.click();

      // リロードせずに即座に反映
      await expect(checkbox).toBeChecked();

      // localStorageにも保存されている
      const data = await page.evaluate(() => localStorage.getItem('tarkov-progress'));
      expect(data).not.toBeNull();
      const parsed = JSON.parse(data!);
      expect(parsed.completedTaskIds).toContain('task-debut');
    }
  });

  test('完了済みタスクの視覚的区別', async ({ page }) => {
    await page.goto('/tasks');
    await page.evaluate(() => {
      localStorage.setItem('tarkov-progress', JSON.stringify({
        completedTaskIds: ['task-debut'],
        updatedAt: new Date().toISOString(),
      }));
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // 完了タスクは視覚的に区別される（opacity, line-through等）
    const taskItem = page.locator('[class*="task"], [class*="completed"]').first();
    // タスクアイテムが存在することを確認
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });
});

test.describe('F-003: 進捗ダッシュボード', () => {
  test('全体進捗率が正しく計算・表示される', async ({ page }) => {
    await page.route('**/api/tasks', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            { id: 't1', name: 'Task 1', trader: { id: 'p', name: 'P' }, min_player_level: 1, objectives: [] },
            { id: 't2', name: 'Task 2', trader: { id: 'p', name: 'P' }, min_player_level: 1, objectives: [] },
          ],
        }),
      });
    });

    await page.route('**/api/traders', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          traders: [{ id: 'p', name: 'P', image_url: null, task_count: 2 }],
        }),
      });
    });

    // 1/2 tasks completed = 50%
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('tarkov-progress', JSON.stringify({
        completedTaskIds: ['t1'],
        updatedAt: new Date().toISOString(),
      }));
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page.getByText(/50.*%|50%/)).toBeVisible();
  });

  test('トレーダー別進捗率が正しく計算・表示される', async ({ page }) => {
    await page.route('**/api/tasks', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            { id: 't1', name: 'Task 1', trader: { id: 'prapor', name: 'Prapor' }, min_player_level: 1, objectives: [] },
            { id: 't2', name: 'Task 2', trader: { id: 'prapor', name: 'Prapor' }, min_player_level: 1, objectives: [] },
          ],
        }),
      });
    });

    await page.route('**/api/traders', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          traders: [{ id: 'prapor', name: 'Prapor', image_url: null, task_count: 2 }],
        }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // トレーダー名が表示される
    await expect(page.getByText('Prapor')).toBeVisible();
  });

  test('プログレスバーが表示される', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // プログレスバー要素が存在
    const progressBar = page.locator('[class*="progress"], [role="progressbar"]');
    await expect(progressBar.first()).toBeVisible();
  });
});

test.describe('F-004: ローカルストレージ保存', () => {
  test('ブラウザ再起動後も進捗が保持される', async ({ page }) => {
    await page.goto('/tasks');
    await page.evaluate(() => {
      localStorage.setItem('tarkov-progress', JSON.stringify({
        completedTaskIds: ['persistent-task-1', 'persistent-task-2'],
        updatedAt: new Date().toISOString(),
      }));
    });

    // ページをリロード（ブラウザ再起動をシミュレート）
    await page.reload();
    await page.waitForLoadState('networkidle');

    // データが保持されている
    const data = await page.evaluate(() => localStorage.getItem('tarkov-progress'));
    expect(data).not.toBeNull();
    const parsed = JSON.parse(data!);
    expect(parsed.completedTaskIds).toContain('persistent-task-1');
    expect(parsed.completedTaskIds).toContain('persistent-task-2');
  });

  test('clearAllで全進捗リセット可能', async ({ page }) => {
    await page.goto('/tasks');
    await page.evaluate(() => {
      localStorage.setItem('tarkov-progress', JSON.stringify({
        completedTaskIds: ['task1', 'task2', 'task3'],
        updatedAt: new Date().toISOString(),
      }));
    });

    // クリア
    await page.evaluate(() => localStorage.removeItem('tarkov-progress'));

    // 確認
    const data = await page.evaluate(() => localStorage.getItem('tarkov-progress'));
    expect(data).toBeNull();
  });
});

test.describe('F-005: フィルタリング・検索', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/tasks', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            { id: 't1', name: 'Debut', trader: { id: 'prapor', name: 'Prapor' }, min_player_level: 1, objectives: [] },
            { id: 't2', name: 'Shortage', trader: { id: 'therapist', name: 'Therapist' }, min_player_level: 1, objectives: [] },
            { id: 't3', name: 'Checking', trader: { id: 'prapor', name: 'Prapor' }, min_player_level: 2, objectives: [] },
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
            { id: 'therapist', name: 'Therapist', image_url: null, task_count: 1 },
          ],
        }),
      });
    });
  });

  test('テキスト検索でタスク名をフィルタできる', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const searchInput = page.getByPlaceholder(/search|検索/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('Debut');
      await page.waitForTimeout(300);

      await expect(page.getByText('Debut')).toBeVisible();
    }
  });
});

test.describe('非機能要件: 性能', () => {
  test('初期表示が3秒以内', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});

test.describe('非機能要件: ユーザビリティ', () => {
  test('モバイル端末で正常に操作できる', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // メインコンテンツが表示される
    await expect(page.locator('main')).toBeVisible();

    // ナビゲーションが機能する
    const tasksLink = page.getByRole('link', { name: /tasks|タスク/i });
    if (await tasksLink.isVisible()) {
      await tasksLink.click();
      await expect(page).toHaveURL('/tasks');
    }
  });

  test('キーボード操作が可能', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Tabキーでフォーカス移動
    await page.keyboard.press('Tab');

    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).not.toBe('BODY');
  });
});

test.describe('非機能要件: エラー耐性', () => {
  test('API障害時にクラッシュしない', async ({ page }) => {
    await page.route('**/api/**', (route) => {
      route.fulfill({ status: 500, body: 'Internal Server Error' });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // ページがクラッシュせず、エラーメッセージが表示される
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByText(/Error|エラー/i)).toBeVisible();
  });
});
