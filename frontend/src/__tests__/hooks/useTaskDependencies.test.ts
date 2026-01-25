import { renderHook, waitFor } from '@testing-library/react';
import { useTaskDependencies } from '@/hooks/useTaskDependencies';

// Mock the API module
jest.mock('@/lib/api', () => ({
  getTaskDependencies: jest.fn(),
}));

import { getTaskDependencies } from '@/lib/api';

const mockGetTaskDependencies = getTaskDependencies as jest.MockedFunction<
  typeof getTaskDependencies
>;

describe('useTaskDependencies', () => {
  const mockDependenciesData = {
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
    ],
    edges: [{ from: 'task1', to: 'task2' }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTaskDependencies.mockResolvedValue(mockDependenciesData);
  });

  it('should fetch dependencies on mount', async () => {
    const { result } = renderHook(() => useTaskDependencies());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetTaskDependencies).toHaveBeenCalledWith(undefined);
    expect(result.current.nodes).toEqual(mockDependenciesData.nodes);
    expect(result.current.edges).toEqual(mockDependenciesData.edges);
  });

  it('should pass trader_id to API when provided', async () => {
    const { result } = renderHook(() => useTaskDependencies('prapor'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetTaskDependencies).toHaveBeenCalledWith({ trader_id: 'prapor' });
  });

  it('should handle API errors', async () => {
    mockGetTaskDependencies.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useTaskDependencies());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.message).toBe('API Error');
    expect(result.current.nodes).toEqual([]);
    expect(result.current.edges).toEqual([]);
  });

  it('should refetch when trader_id changes', async () => {
    const { result, rerender } = renderHook(
      ({ traderId }) => useTaskDependencies(traderId),
      { initialProps: { traderId: undefined as string | undefined } }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetTaskDependencies).toHaveBeenCalledTimes(1);

    rerender({ traderId: 'prapor' });

    await waitFor(() => {
      expect(mockGetTaskDependencies).toHaveBeenCalledTimes(2);
    });

    expect(mockGetTaskDependencies).toHaveBeenLastCalledWith({ trader_id: 'prapor' });
  });

  it('should provide refetch function', async () => {
    const { result } = renderHook(() => useTaskDependencies());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetTaskDependencies).toHaveBeenCalledTimes(1);

    await result.current.refetch();

    expect(mockGetTaskDependencies).toHaveBeenCalledTimes(2);
  });
});
