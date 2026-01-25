/**
 * API client integration tests.
 * Tests the API client functions with mocked fetch responses.
 */
import { getTraders, getTasks, getTask } from '@/lib/api';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('API Client Integration', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('getTraders', () => {
    it('should fetch traders from API', async () => {
      const mockResponse = {
        traders: [
          { id: 'prapor', name: 'Prapor', image_url: 'https://example.com/prapor.jpg', task_count: 10 },
          { id: 'therapist', name: 'Therapist', image_url: 'https://example.com/therapist.jpg', task_count: 8 },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getTraders();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/traders');
      expect(result.traders).toHaveLength(2);
      expect(result.traders[0].name).toBe('Prapor');
    });

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getTraders()).rejects.toThrow('API error: 500');
    });
  });

  describe('getTasks', () => {
    const mockTasksResponse = {
      tasks: [
        {
          id: 'task1',
          name: 'Debut',
          trader: { id: 'prapor', name: 'Prapor' },
          min_player_level: 1,
          objectives: [],
        },
      ],
    };

    it('should fetch all tasks without filters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasksResponse,
      });

      const result = await getTasks();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/tasks');
      expect(result.tasks).toHaveLength(1);
    });

    it('should include trader_id in query params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasksResponse,
      });

      await getTasks({ trader_id: 'prapor' });

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/tasks?trader_id=prapor');
    });

    it('should include search in query params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasksResponse,
      });

      await getTasks({ search: 'debut' });

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/tasks?search=debut');
    });

    it('should include both filters in query params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasksResponse,
      });

      await getTasks({ trader_id: 'prapor', search: 'check' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('trader_id=prapor')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('search=check')
      );
    });
  });

  describe('getTask', () => {
    it('should fetch single task by ID', async () => {
      const mockTask = {
        id: 'task1',
        name: 'Debut',
        trader: { id: 'prapor', name: 'Prapor' },
        min_player_level: 1,
        objectives: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTask,
      });

      const result = await getTask('task1');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/tasks/task1');
      expect(result.name).toBe('Debut');
    });

    it('should throw error for non-existent task', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(getTask('nonexistent')).rejects.toThrow('API error: 404');
    });
  });
});

describe('API Error Handling', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(getTraders()).rejects.toThrow('Network error');
  });

  it('should handle JSON parse errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    await expect(getTraders()).rejects.toThrow('Invalid JSON');
  });
});
