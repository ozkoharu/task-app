import { renderHook, act } from '@testing-library/react';
import { useProgress } from '@/hooks/useProgress';
import * as storage from '@/lib/storage';

jest.mock('@/lib/storage');

const mockStorage = storage as jest.Mocked<typeof storage>;

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
});
