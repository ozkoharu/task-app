import { getProgress, saveProgress, clearProgress } from '@/lib/storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getProgress', () => {
    it('should return default values when no data is stored', () => {
      const result = getProgress();

      expect(result.completedTaskIds).toEqual([]);
      expect(result.updatedAt).toBeDefined();
    });

    it('should return stored data', () => {
      const data = {
        completedTaskIds: ['task-1', 'task-2'],
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      localStorage.setItem('tarkov-progress', JSON.stringify(data));

      const result = getProgress();

      expect(result.completedTaskIds).toEqual(['task-1', 'task-2']);
      expect(result.updatedAt).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should return default values when stored data is invalid JSON', () => {
      localStorage.setItem('tarkov-progress', 'invalid-json');

      const result = getProgress();

      expect(result.completedTaskIds).toEqual([]);
    });
  });

  describe('saveProgress', () => {
    it('should save data to localStorage', () => {
      const data = {
        completedTaskIds: ['task-1'],
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      saveProgress(data);

      const stored = localStorage.getItem('tarkov-progress');
      expect(stored).toBe(JSON.stringify(data));
    });
  });

  describe('clearProgress', () => {
    it('should remove data from localStorage', () => {
      localStorage.setItem('tarkov-progress', '{"completedTaskIds":[]}');

      clearProgress();

      expect(localStorage.getItem('tarkov-progress')).toBeNull();
    });
  });
});
