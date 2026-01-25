'use client';

import { useMemo } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useProgress } from '@/hooks/useProgress';
import { useTaskFilter } from '@/hooks/useTaskFilter';
import TaskList from '@/components/tasks/TaskList';
import TaskFilter from '@/components/tasks/TaskFilter';

export default function TasksPage() {
  const { traders, tasks, isLoading, error } = useTasks();
  const { completedTaskIds, toggleTask, getProgressStats } = useProgress();
  const {
    filters,
    setTraderId,
    setStatus,
    setSearch,
    clearFilters,
    filterTasks,
  } = useTaskFilter();

  const filteredTasks = useMemo(
    () => filterTasks(tasks, completedTaskIds),
    [filterTasks, tasks, completedTaskIds]
  );

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

  const stats = getProgressStats(tasks.length);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-tarkov-accent">Task List</h1>
        <span className="text-tarkov-text/60">
          {stats.completed}/{stats.total} completed ({stats.percentage}%)
        </span>
      </div>
      <TaskFilter
        traders={traders}
        traderId={filters.traderId}
        status={filters.status}
        search={filters.search}
        resultCount={filteredTasks.length}
        onTraderChange={setTraderId}
        onStatusChange={setStatus}
        onSearchChange={setSearch}
        onClear={clearFilters}
      />
      <TaskList
        traders={traders}
        tasks={filteredTasks}
        completedTaskIds={completedTaskIds}
        onToggleTask={toggleTask}
      />
    </div>
  );
}
