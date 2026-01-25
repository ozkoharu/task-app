'use client';

import { useState, useEffect } from 'react';
import { getTraders, getTasks } from '@/lib/api';
import { Trader, Task } from '@/types';

interface UseTasksReturn {
  traders: Trader[];
  tasks: Task[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTasks(): UseTasksReturn {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [tradersRes, tasksRes] = await Promise.all([
        getTraders(),
        getTasks(),
      ]);
      setTraders(tradersRes.traders);
      setTasks(tasksRes.tasks);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch data'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    traders,
    tasks,
    isLoading,
    error,
    refetch: fetchData,
  };
}
