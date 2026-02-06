'use client';

import { useTasks } from '@/hooks/useTasks';
import { useProgress } from '@/hooks/useProgress';
import OverallProgress from '@/components/dashboard/OverallProgress';
import TraderProgress from '@/components/dashboard/TraderProgress';

export default function Home() {
  const { traders, tasks, isLoading, error } = useTasks();
  const { completedTaskIds } = useProgress();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-tarkov-accent">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
        <p className="text-red-400">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-tarkov-accent">Dashboard</h1>
      <OverallProgress total={tasks.length} completed={completedTaskIds.length} />
      <TraderProgress
        traders={traders}
        tasks={tasks}
        completedTaskIds={completedTaskIds}
      />
    </div>
  );
}
