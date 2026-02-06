'use client';

import { Task } from '@/types';
import TaskCheckbox from './TaskCheckbox';

interface TaskItemProps {
  task: Task;
  isCompleted: boolean;
  onToggle: () => void;
}

export default function TaskItem({
  task,
  isCompleted,
  onToggle,
}: TaskItemProps) {
  return (
    <div
      className={`flex items-center gap-4 p-3 rounded transition-colors ${
        isCompleted
          ? 'bg-tarkov-darker/50'
          : 'bg-tarkov-dark/30 hover:bg-tarkov-dark/50'
      }`}
    >
      <TaskCheckbox checked={isCompleted} onChange={onToggle} />
      <div className="flex-grow min-w-0">
        <span
          className={`block truncate ${
            isCompleted
              ? 'text-tarkov-text/40 line-through'
              : 'text-tarkov-text'
          }`}
        >
          {task.name}
        </span>
      </div>
      <span
        className={`text-xs px-2 py-1 rounded ${
          isCompleted
            ? 'bg-tarkov-darker text-tarkov-text/40'
            : 'bg-tarkov-accent/20 text-tarkov-accent'
        }`}
      >
        Lv.{task.min_player_level}
      </span>
    </div>
  );
}
