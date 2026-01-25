/**
 * localStorage persistence integration tests.
 */
import { getProgress, saveProgress, clearProgress } from '@/lib/storage';
import { ProgressData } from '@/types';

describe('localStorage Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveProgress and getProgress', () => {
    it('should save and retrieve progress data', () => {
      const testData: ProgressData = {
        completedTaskIds: ['task1', 'task2', 'task3'],
        updatedAt: '2026-01-25T10:00:00.000Z',
      };

      saveProgress(testData);
      const retrieved = getProgress();

      expect(retrieved.completedTaskIds).toEqual(['task1', 'task2', 'task3']);
      expect(retrieved.updatedAt).toBe('2026-01-25T10:00:00.000Z');
    });

    it('should return empty data when localStorage is empty', () => {
      const result = getProgress();

      expect(result.completedTaskIds).toEqual([]);
      expect(result.updatedAt).toBeDefined();
    });

    it('should persist data across multiple saves', () => {
      saveProgress({ completedTaskIds: ['task1'], updatedAt: '2026-01-25T10:00:00.000Z' });
      saveProgress({ completedTaskIds: ['task1', 'task2'], updatedAt: '2026-01-25T11:00:00.000Z' });
      saveProgress({ completedTaskIds: ['task1', 'task2', 'task3'], updatedAt: '2026-01-25T12:00:00.000Z' });

      const result = getProgress();
      expect(result.completedTaskIds).toEqual(['task1', 'task2', 'task3']);
    });

    it('should handle large number of completed tasks', () => {
      const manyTaskIds = Array.from({ length: 500 }, (_, i) => `task-${i}`);
      const testData: ProgressData = {
        completedTaskIds: manyTaskIds,
        updatedAt: new Date().toISOString(),
      };

      saveProgress(testData);
      const retrieved = getProgress();

      expect(retrieved.completedTaskIds).toHaveLength(500);
      expect(retrieved.completedTaskIds[0]).toBe('task-0');
      expect(retrieved.completedTaskIds[499]).toBe('task-499');
    });
  });

  describe('clearProgress', () => {
    it('should clear all progress data', () => {
      saveProgress({
        completedTaskIds: ['task1', 'task2'],
        updatedAt: '2026-01-25T10:00:00.000Z',
      });

      clearProgress();
      const result = getProgress();

      expect(result.completedTaskIds).toEqual([]);
    });

    it('should not throw when called on empty storage', () => {
      expect(() => clearProgress()).not.toThrow();
    });
  });

  describe('Data Integrity', () => {
    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('tarkov-progress', 'invalid-json-{{{');

      const result = getProgress();
      expect(result.completedTaskIds).toEqual([]);
    });

    it('should handle missing completedTaskIds field', () => {
      localStorage.setItem('tarkov-progress', JSON.stringify({ updatedAt: '2026-01-25' }));

      // getProgress should handle missing fields
      const result = getProgress();
      expect(result).toBeDefined();
    });

    it('should maintain data type integrity', () => {
      const testData: ProgressData = {
        completedTaskIds: ['task1'],
        updatedAt: '2026-01-25T10:00:00.000Z',
      };

      saveProgress(testData);
      const retrieved = getProgress();

      expect(Array.isArray(retrieved.completedTaskIds)).toBe(true);
      expect(typeof retrieved.updatedAt).toBe('string');
    });
  });

  describe('Storage Key', () => {
    it('should use correct storage key', () => {
      saveProgress({
        completedTaskIds: ['task1'],
        updatedAt: '2026-01-25T10:00:00.000Z',
      });

      const rawData = localStorage.getItem('tarkov-progress');
      expect(rawData).not.toBeNull();

      const parsed = JSON.parse(rawData!);
      expect(parsed.completedTaskIds).toContain('task1');
    });
  });
});

describe('Cross-tab Synchronization', () => {
  it('should store data in a format readable by other tabs', () => {
    saveProgress({
      completedTaskIds: ['task1', 'task2'],
      updatedAt: '2026-01-25T10:00:00.000Z',
    });

    // Simulate reading from another context
    const rawData = localStorage.getItem('tarkov-progress');
    const parsed = JSON.parse(rawData!);

    expect(parsed.completedTaskIds).toEqual(['task1', 'task2']);
    expect(parsed.updatedAt).toBe('2026-01-25T10:00:00.000Z');
  });
});
