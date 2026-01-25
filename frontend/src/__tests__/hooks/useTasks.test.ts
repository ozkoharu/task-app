import { renderHook, waitFor } from '@testing-library/react';
import { useTasks } from '@/hooks/useTasks';
import * as api from '@/lib/api';

jest.mock('@/lib/api');

const mockApi = api as jest.Mocked<typeof api>;

const mockTraders = [
  { id: 'prapor', name: 'Prapor', image_url: 'https://example.com/prapor.jpg', task_count: 2 },
  { id: 'therapist', name: 'Therapist', image_url: null, task_count: 1 },
];

const mockTasks = [
  {
    id: 'task-1',
    name: 'Debut',
    trader: { id: 'prapor', name: 'Prapor' },
    min_player_level: 1,
    wiki_link: 'https://wiki.example.com/debut',
    objectives: [],
  },
  {
    id: 'task-2',
    name: 'Checking',
    trader: { id: 'prapor', name: 'Prapor' },
    min_player_level: 2,
    wiki_link: null,
    objectives: [],
  },
];

describe('useTasks', () => {
  beforeEach(() => {
    mockApi.getTraders.mockResolvedValue({ traders: mockTraders });
    mockApi.getTasks.mockResolvedValue({ tasks: mockTasks });
  });

  it('should start with loading state', () => {
    const { result } = renderHook(() => useTasks());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.traders).toEqual([]);
    expect(result.current.tasks).toEqual([]);
  });

  it('should fetch traders and tasks on mount', async () => {
    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.traders).toEqual(mockTraders);
    expect(result.current.tasks).toEqual(mockTasks);
    expect(result.current.error).toBeNull();
  });

  it('should handle API errors', async () => {
    const error = new Error('API Error');
    mockApi.getTraders.mockRejectedValue(error);

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toEqual(error);
    expect(result.current.traders).toEqual([]);
  });

  it('should handle non-Error exceptions', async () => {
    mockApi.getTraders.mockRejectedValue('string error');

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Failed to fetch data');
  });

  it('should refetch data when refetch is called', async () => {
    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockApi.getTraders).toHaveBeenCalledTimes(1);

    await result.current.refetch();

    expect(mockApi.getTraders).toHaveBeenCalledTimes(2);
  });
});
