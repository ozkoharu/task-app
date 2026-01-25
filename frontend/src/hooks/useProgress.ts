'use client';

import { useState, useEffect, useCallback } from 'react';
import { getProgress, saveProgress, clearProgress } from '@/lib/storage';

interface UseProgressReturn {
  completedTaskIds: string[];
  isCompleted: (taskId: string) => boolean;
  toggleTask: (taskId: string) => void;
  completeTask: (taskId: string) => void;
  uncompleteTask: (taskId: string) => void;
  clearAll: () => void;
  getProgressStats: (totalTasks: number) => {
    total: number;
    completed: number;
    percentage: number;
  };
}

export function useProgress(): UseProgressReturn {
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const data = getProgress();
    setCompletedTaskIds(data.completedTaskIds);
    setIsLoaded(true);
  }, []);

  // Listen for storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'tarkov-progress' && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          setCompletedTaskIds(data.completedTaskIds || []);
        } catch {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Save to localStorage when completedTaskIds changes
  useEffect(() => {
    if (isLoaded) {
      saveProgress({
        completedTaskIds,
        updatedAt: new Date().toISOString(),
      });
    }
  }, [completedTaskIds, isLoaded]);

  const isCompleted = useCallback(
    (taskId: string): boolean => {
      return completedTaskIds.includes(taskId);
    },
    [completedTaskIds]
  );

  const toggleTask = useCallback((taskId: string): void => {
    setCompletedTaskIds((prev) => {
      if (prev.includes(taskId)) {
        return prev.filter((id) => id !== taskId);
      }
      return [...prev, taskId];
    });
  }, []);

  const completeTask = useCallback((taskId: string): void => {
    setCompletedTaskIds((prev) => {
      if (prev.includes(taskId)) {
        return prev;
      }
      return [...prev, taskId];
    });
  }, []);

  const uncompleteTask = useCallback((taskId: string): void => {
    setCompletedTaskIds((prev) => prev.filter((id) => id !== taskId));
  }, []);

  const clearAll = useCallback((): void => {
    setCompletedTaskIds([]);
    clearProgress();
  }, []);

  const getProgressStats = useCallback(
    (totalTasks: number) => {
      const completed = completedTaskIds.length;
      const percentage = totalTasks > 0 ? (completed / totalTasks) * 100 : 0;
      return {
        total: totalTasks,
        completed,
        percentage: Math.round(percentage * 10) / 10,
      };
    },
    [completedTaskIds]
  );

  return {
    completedTaskIds,
    isCompleted,
    toggleTask,
    completeTask,
    uncompleteTask,
    clearAll,
    getProgressStats,
  };
}
