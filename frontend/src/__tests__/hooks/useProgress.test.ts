import { renderHook, act } from '@testing-library/react';
import { useProgress } from '@/hooks/useProgress';
import * as storage from '@/lib/storage';
import { Task } from '@/types';

jest.mock('@/lib/storage');

const mockStorage = storage as jest.Mocked<typeof storage>;

// テスト用のタスクデータ
const createMockTask = (
  id: string,
  prerequisiteTaskIds: string[] = []
): Task => ({
  id,
  name: `Task ${id}`,
  trader: { id: 'trader1', name: 'Prapor' },
  min_player_level: 1,
  wiki_link: null,
  objectives: [],
  prerequisite_task_ids: prerequisiteTaskIds,
});

describe('useProgress', () => {
  beforeEach(() => {
    mockStorage.getProgress.mockReturnValue({
      completedTaskIds: [],
      updatedAt: new Date().toISOString(),
    });
    mockStorage.saveProgress.mockImplementation(() => {});
    mockStorage.clearProgress.mockImplementation(() => {});
  });

  it('should initialize with empty completedTaskIds', () => {
    const { result } = renderHook(() => useProgress());

    expect(result.current.completedTaskIds).toEqual([]);
  });

  it('should load completed tasks from storage on mount', () => {
    mockStorage.getProgress.mockReturnValue({
      completedTaskIds: ['task-1', 'task-2'],
      updatedAt: new Date().toISOString(),
    });

    const { result } = renderHook(() => useProgress());

    expect(result.current.completedTaskIds).toEqual(['task-1', 'task-2']);
  });

  it('should toggle task completion', () => {
    const { result } = renderHook(() => useProgress());

    act(() => {
      result.current.toggleTask('task-1');
    });

    expect(result.current.isCompleted('task-1')).toBe(true);

    act(() => {
      result.current.toggleTask('task-1');
    });

    expect(result.current.isCompleted('task-1')).toBe(false);
  });

  it('should return true for completed tasks', () => {
    mockStorage.getProgress.mockReturnValue({
      completedTaskIds: ['task-1'],
      updatedAt: new Date().toISOString(),
    });

    const { result } = renderHook(() => useProgress());

    expect(result.current.isCompleted('task-1')).toBe(true);
    expect(result.current.isCompleted('task-2')).toBe(false);
  });

  it('should complete a task', () => {
    const { result } = renderHook(() => useProgress());

    act(() => {
      result.current.completeTask('task-1');
    });

    expect(result.current.isCompleted('task-1')).toBe(true);
  });

  it('should not duplicate task when completing already completed task', () => {
    mockStorage.getProgress.mockReturnValue({
      completedTaskIds: ['task-1'],
      updatedAt: new Date().toISOString(),
    });

    const { result } = renderHook(() => useProgress());

    act(() => {
      result.current.completeTask('task-1');
    });

    expect(result.current.completedTaskIds).toEqual(['task-1']);
  });

  it('should uncomplete a task', () => {
    mockStorage.getProgress.mockReturnValue({
      completedTaskIds: ['task-1', 'task-2'],
      updatedAt: new Date().toISOString(),
    });

    const { result } = renderHook(() => useProgress());

    act(() => {
      result.current.uncompleteTask('task-1');
    });

    expect(result.current.isCompleted('task-1')).toBe(false);
    expect(result.current.isCompleted('task-2')).toBe(true);
  });

  it('should clear all completed tasks', () => {
    mockStorage.getProgress.mockReturnValue({
      completedTaskIds: ['task-1', 'task-2'],
      updatedAt: new Date().toISOString(),
    });

    const { result } = renderHook(() => useProgress());

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.completedTaskIds).toEqual([]);
    expect(mockStorage.clearProgress).toHaveBeenCalled();
  });

  it('should calculate progress stats correctly', () => {
    mockStorage.getProgress.mockReturnValue({
      completedTaskIds: ['task-1', 'task-2', 'task-3'],
      updatedAt: new Date().toISOString(),
    });

    const { result } = renderHook(() => useProgress());
    const stats = result.current.getProgressStats(10);

    expect(stats.total).toBe(10);
    expect(stats.completed).toBe(3);
    expect(stats.percentage).toBe(30);
  });

  it('should return 0 percentage when totalTasks is 0', () => {
    const { result } = renderHook(() => useProgress());
    const stats = result.current.getProgressStats(0);

    expect(stats.percentage).toBe(0);
  });

  it('should save to localStorage when completedTaskIds changes', () => {
    const { result } = renderHook(() => useProgress());

    act(() => {
      result.current.toggleTask('task-1');
    });

    expect(mockStorage.saveProgress).toHaveBeenCalled();
  });

  describe('completeTaskWithPrerequisites', () => {
    it('should complete task and its prerequisite tasks', () => {
      const { result } = renderHook(() => useProgress());

      // task3 -> task2 -> task1 の依存関係
      const tasksMap = new Map<string, Task>([
        ['task1', createMockTask('task1', [])],
        ['task2', createMockTask('task2', ['task1'])],
        ['task3', createMockTask('task3', ['task2'])],
      ]);

      act(() => {
        result.current.completeTaskWithPrerequisites('task3', tasksMap);
      });

      // task3をチェックすると、task2, task1も自動的にチェック
      expect(result.current.isCompleted('task1')).toBe(true);
      expect(result.current.isCompleted('task2')).toBe(true);
      expect(result.current.isCompleted('task3')).toBe(true);
    });

    it('should not duplicate already completed tasks', () => {
      mockStorage.getProgress.mockReturnValue({
        completedTaskIds: ['task1'],
        updatedAt: new Date().toISOString(),
      });

      const { result } = renderHook(() => useProgress());

      const tasksMap = new Map<string, Task>([
        ['task1', createMockTask('task1', [])],
        ['task2', createMockTask('task2', ['task1'])],
      ]);

      act(() => {
        result.current.completeTaskWithPrerequisites('task2', tasksMap);
      });

      // 重複なく追加される
      expect(result.current.completedTaskIds).toEqual(['task1', 'task2']);
    });

    it('should handle circular dependencies gracefully', () => {
      const { result } = renderHook(() => useProgress());

      // 循環参照: taskA -> taskB -> taskA
      const tasksMap = new Map<string, Task>([
        ['taskA', createMockTask('taskA', ['taskB'])],
        ['taskB', createMockTask('taskB', ['taskA'])],
      ]);

      act(() => {
        // 循環参照でも無限ループにならない
        result.current.completeTaskWithPrerequisites('taskA', tasksMap);
      });

      expect(result.current.isCompleted('taskA')).toBe(true);
      expect(result.current.isCompleted('taskB')).toBe(true);
    });

    it('should handle multiple prerequisite tasks', () => {
      const { result } = renderHook(() => useProgress());

      // task4 -> [task2, task3], task2 -> task1, task3 -> task1
      const tasksMap = new Map<string, Task>([
        ['task1', createMockTask('task1', [])],
        ['task2', createMockTask('task2', ['task1'])],
        ['task3', createMockTask('task3', ['task1'])],
        ['task4', createMockTask('task4', ['task2', 'task3'])],
      ]);

      act(() => {
        result.current.completeTaskWithPrerequisites('task4', tasksMap);
      });

      expect(result.current.isCompleted('task1')).toBe(true);
      expect(result.current.isCompleted('task2')).toBe(true);
      expect(result.current.isCompleted('task3')).toBe(true);
      expect(result.current.isCompleted('task4')).toBe(true);
    });

    it('should handle task with no prerequisites', () => {
      const { result } = renderHook(() => useProgress());

      const tasksMap = new Map<string, Task>([
        ['task1', createMockTask('task1', [])],
      ]);

      act(() => {
        result.current.completeTaskWithPrerequisites('task1', tasksMap);
      });

      expect(result.current.isCompleted('task1')).toBe(true);
      expect(result.current.completedTaskIds).toEqual(['task1']);
    });

    it('should handle non-existent prerequisite task gracefully', () => {
      const { result } = renderHook(() => useProgress());

      // task2はtask1を前提とするが、task1はMapに存在しない
      const tasksMap = new Map<string, Task>([
        ['task2', createMockTask('task2', ['task1'])],
      ]);

      act(() => {
        result.current.completeTaskWithPrerequisites('task2', tasksMap);
      });

      // task2自体はチェックされる（task1は存在しないのでスキップ）
      expect(result.current.isCompleted('task2')).toBe(true);
      // task1はMapに存在しないが、IDとしては追加される
      expect(result.current.completedTaskIds).toContain('task1');
      expect(result.current.completedTaskIds).toContain('task2');
    });
  });
});
