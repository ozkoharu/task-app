'use client';

import { useState, useMemo, useCallback } from 'react';
import { Task } from '@/types';

export type StatusFilter = 'all' | 'completed' | 'incomplete';

interface FilterState {
  traderId: string;
  status: StatusFilter;
  search: string;
}

interface UseTaskFilterReturn {
  filters: FilterState;
  setTraderId: (traderId: string) => void;
  setStatus: (status: StatusFilter) => void;
  setSearch: (search: string) => void;
  clearFilters: () => void;
  filterTasks: (tasks: Task[], completedTaskIds: string[]) => Task[];
}

const initialFilters: FilterState = {
  traderId: 'all',
  status: 'all',
  search: '',
};

export function useTaskFilter(): UseTaskFilterReturn {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const setTraderId = useCallback((traderId: string) => {
    setFilters((prev) => ({ ...prev, traderId }));
  }, []);

  const setStatus = useCallback((status: StatusFilter) => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const filterTasks = useCallback(
    (tasks: Task[], completedTaskIds: string[]): Task[] => {
      return tasks.filter((task) => {
        // Filter by trader
        if (filters.traderId !== 'all' && task.trader.id !== filters.traderId) {
          return false;
        }

        // Filter by status
        const isCompleted = completedTaskIds.includes(task.id);
        if (filters.status === 'completed' && !isCompleted) {
          return false;
        }
        if (filters.status === 'incomplete' && isCompleted) {
          return false;
        }

        // Filter by search
        if (
          filters.search &&
          !task.name.toLowerCase().includes(filters.search.toLowerCase())
        ) {
          return false;
        }

        return true;
      });
    },
    [filters]
  );

  return {
    filters,
    setTraderId,
    setStatus,
    setSearch,
    clearFilters,
    filterTasks,
  };
}
