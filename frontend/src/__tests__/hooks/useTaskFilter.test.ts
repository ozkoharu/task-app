import { renderHook, act } from '@testing-library/react';
import { useTaskFilter } from '@/hooks/useTaskFilter';
import { Task } from '@/types';

const mockTasks: Task[] = [
  {
    id: 'task-1',
    name: 'Debut',
    trader: { id: 'prapor', name: 'Prapor' },
    min_player_level: 1,
    wiki_link: null,
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
  {
    id: 'task-3',
    name: 'Painkiller',
    trader: { id: 'therapist', name: 'Therapist' },
    min_player_level: 1,
    wiki_link: null,
    objectives: [],
  },
];

describe('useTaskFilter', () => {
  it('should initialize with default filters', () => {
    const { result } = renderHook(() => useTaskFilter());

    expect(result.current.filters).toEqual({
      traderId: 'all',
      status: 'all',
      search: '',
    });
  });

  it('should set traderId filter', () => {
    const { result } = renderHook(() => useTaskFilter());

    act(() => {
      result.current.setTraderId('prapor');
    });

    expect(result.current.filters.traderId).toBe('prapor');
  });

  it('should set status filter', () => {
    const { result } = renderHook(() => useTaskFilter());

    act(() => {
      result.current.setStatus('completed');
    });

    expect(result.current.filters.status).toBe('completed');
  });

  it('should set search filter', () => {
    const { result } = renderHook(() => useTaskFilter());

    act(() => {
      result.current.setSearch('debut');
    });

    expect(result.current.filters.search).toBe('debut');
  });

  it('should clear all filters', () => {
    const { result } = renderHook(() => useTaskFilter());

    act(() => {
      result.current.setTraderId('prapor');
      result.current.setStatus('completed');
      result.current.setSearch('debut');
    });

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filters).toEqual({
      traderId: 'all',
      status: 'all',
      search: '',
    });
  });

  it('should filter tasks by trader', () => {
    const { result } = renderHook(() => useTaskFilter());

    act(() => {
      result.current.setTraderId('prapor');
    });

    const filtered = result.current.filterTasks(mockTasks, []);

    expect(filtered).toHaveLength(2);
    expect(filtered.every((t) => t.trader.id === 'prapor')).toBe(true);
  });

  it('should filter tasks by completed status', () => {
    const { result } = renderHook(() => useTaskFilter());

    act(() => {
      result.current.setStatus('completed');
    });

    const filtered = result.current.filterTasks(mockTasks, ['task-1', 'task-3']);

    expect(filtered).toHaveLength(2);
    expect(filtered.map((t) => t.id)).toEqual(['task-1', 'task-3']);
  });

  it('should filter tasks by incomplete status', () => {
    const { result } = renderHook(() => useTaskFilter());

    act(() => {
      result.current.setStatus('incomplete');
    });

    const filtered = result.current.filterTasks(mockTasks, ['task-1']);

    expect(filtered).toHaveLength(2);
    expect(filtered.map((t) => t.id)).toEqual(['task-2', 'task-3']);
  });

  it('should filter tasks by search (case insensitive)', () => {
    const { result } = renderHook(() => useTaskFilter());

    act(() => {
      result.current.setSearch('DEBUT');
    });

    const filtered = result.current.filterTasks(mockTasks, []);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Debut');
  });

  it('should combine multiple filters', () => {
    const { result } = renderHook(() => useTaskFilter());

    act(() => {
      result.current.setTraderId('prapor');
      result.current.setStatus('incomplete');
    });

    const filtered = result.current.filterTasks(mockTasks, ['task-1']);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('task-2');
  });

  it('should return all tasks when no filters are applied', () => {
    const { result } = renderHook(() => useTaskFilter());

    const filtered = result.current.filterTasks(mockTasks, []);

    expect(filtered).toHaveLength(3);
  });
});
