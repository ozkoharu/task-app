'use client';

import { Task, Trader } from '@/types';
import TaskItem from './TaskItem';

interface TaskListProps {
  traders: Trader[];
  tasks: Task[];
  completedTaskIds: string[];
  onToggleTask: (taskId: string) => void;
}

export default function TaskList({
  traders,
  tasks,
  completedTaskIds,
  onToggleTask,
}: TaskListProps) {
  const tasksByTrader = traders.map((trader) => ({
    trader,
    tasks: tasks
      .filter((task) => task.trader.id === trader.id)
      .sort((a, b) => a.min_player_level - b.min_player_level),
  }));

  return (
    <div className="space-y-6">
      {tasksByTrader.map(({ trader, tasks: traderTasks }) => {
        if (traderTasks.length === 0) return null;

        const completedCount = traderTasks.filter((t) =>
          completedTaskIds.includes(t.id)
        ).length;

        return (
          <div
            key={trader.id}
            className="bg-tarkov-dark rounded-lg border border-tarkov-accent/30 overflow-hidden"
          >
            <div className="bg-tarkov-accent/10 px-4 py-3 border-b border-tarkov-accent/30">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-tarkov-accent">{trader.name}</h3>
                <span className="text-sm text-tarkov-text/60">
                  {completedCount}/{traderTasks.length}
                </span>
              </div>
            </div>
            <div className="p-2 space-y-1">
              {traderTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isCompleted={completedTaskIds.includes(task.id)}
                  onToggle={() => onToggleTask(task.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
