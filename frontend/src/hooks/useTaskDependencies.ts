'use client';

import { useState, useEffect, useCallback } from 'react';
import { getTaskDependencies } from '@/lib/api';
import { TaskNode, TaskEdge } from '@/types';

interface UseTaskDependenciesReturn {
  nodes: TaskNode[];
  edges: TaskEdge[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTaskDependencies(traderId?: string): UseTaskDependenciesReturn {
  const [nodes, setNodes] = useState<TaskNode[]>([]);
  const [edges, setEdges] = useState<TaskEdge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTaskDependencies(
        traderId ? { trader_id: traderId } : undefined
      );
      setNodes(data.nodes);
      setEdges(data.edges);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch dependencies'));
    } finally {
      setIsLoading(false);
    }
  }, [traderId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    nodes,
    edges,
    isLoading,
    error,
    refetch: fetchData,
  };
}
