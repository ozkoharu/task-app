'use client';

import { useState, useCallback } from 'react';
import { useTaskDependencies } from '@/hooks/useTaskDependencies';
import { useProgress } from '@/hooks/useProgress';
import { useTasks } from '@/hooks/useTasks';
import { TaskMapCanvas } from '@/components/taskmap/TaskMapCanvas';

export default function TaskMapPage() {
  const [selectedTraderId, setSelectedTraderId] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const { nodes, edges, isLoading, error } = useTaskDependencies(
    selectedTraderId || undefined
  );
  const { traders } = useTasks();
  const { completedTaskIds, toggleTask, isCompleted } = useProgress();

  const handleTaskClick = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
  }, []);

  const handleTaskDoubleClick = useCallback(
    (taskId: string) => {
      toggleTask(taskId);
    },
    [toggleTask]
  );

  const selectedTask = selectedTaskId
    ? nodes.find((n) => n.id === selectedTaskId)
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-tarkov-accent">Loading task map...</div>
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-tarkov-accent">Task Map</h1>

        <div className="flex items-center gap-4">
          <select
            value={selectedTraderId}
            onChange={(e) => setSelectedTraderId(e.target.value)}
            className="bg-tarkov-bg border border-tarkov-border rounded px-3 py-2 text-tarkov-text focus:outline-none focus:border-tarkov-accent"
          >
            <option value="">All Traders</option>
            {traders.map((trader) => (
              <option key={trader.id} value={trader.id}>
                {trader.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-sm text-gray-400 mb-2">
        Click a task to view details. Double-click to toggle completion.
      </div>

      <div className="flex gap-4 h-[calc(100vh-280px)]">
        {/* Task Map Canvas */}
        <div className="flex-1 border border-tarkov-border rounded-lg overflow-hidden">
          <TaskMapCanvas
            nodes={nodes}
            edges={edges}
            completedTaskIds={completedTaskIds}
            onTaskClick={handleTaskClick}
            onTaskDoubleClick={handleTaskDoubleClick}
          />
        </div>

        {/* Task Detail Panel */}
        {selectedTask && (
          <div className="w-80 bg-tarkov-bg border border-tarkov-border rounded-lg p-4 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-tarkov-accent">
                  {selectedTask.name}
                </h2>
                <p className="text-sm text-gray-400">{selectedTask.trader_name}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Required Level</span>
                  <span className="text-tarkov-text">
                    Lv. {selectedTask.min_player_level}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Status</span>
                  <span
                    className={
                      isCompleted(selectedTask.id)
                        ? 'text-green-400'
                        : 'text-yellow-400'
                    }
                  >
                    {isCompleted(selectedTask.id) ? 'Completed' : 'In Progress'}
                  </span>
                </div>
              </div>

              {selectedTask.prerequisite_task_ids.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">
                    Prerequisites ({selectedTask.prerequisite_task_ids.length})
                  </h3>
                  <ul className="space-y-1">
                    {selectedTask.prerequisite_task_ids.map((prereqId) => {
                      const prereqTask = nodes.find((n) => n.id === prereqId);
                      const completed = isCompleted(prereqId);
                      return (
                        <li
                          key={prereqId}
                          className={`text-sm flex items-center gap-2 ${
                            completed ? 'text-green-400' : 'text-gray-400'
                          }`}
                        >
                          <span>{completed ? '✓' : '○'}</span>
                          <span className={completed ? 'line-through' : ''}>
                            {prereqTask?.name || prereqId}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <div className="pt-4 space-y-2">
                <button
                  onClick={() => toggleTask(selectedTask.id)}
                  className={`w-full py-2 px-4 rounded font-medium transition-colors ${
                    isCompleted(selectedTask.id)
                      ? 'bg-gray-600 hover:bg-gray-500 text-white'
                      : 'bg-green-600 hover:bg-green-500 text-white'
                  }`}
                >
                  {isCompleted(selectedTask.id)
                    ? 'Mark as Incomplete'
                    : 'Mark as Complete'}
                </button>

                {selectedTask.wiki_link && (
                  <a
                    href={selectedTask.wiki_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2 px-4 rounded font-medium text-center bg-tarkov-border hover:bg-tarkov-accent/20 text-tarkov-text transition-colors"
                  >
                    View on Wiki
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
