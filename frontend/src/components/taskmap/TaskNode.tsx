'use client';

import { memo } from 'react';
import { Handle, Position, type Node } from '@xyflow/react';

export interface TaskNodeData {
  id: string;
  name: string;
  traderName: string;
  traderId: string;
  minPlayerLevel: number;
  wikiLink: string | null;
  isCompleted: boolean;
  isAvailable: boolean;
  [key: string]: unknown;
}

export type TaskNodeType = Node<TaskNodeData, 'taskNode'>;

const traderColors: Record<string, string> = {
  prapor: 'border-red-500',
  therapist: 'border-pink-500',
  fence: 'border-gray-500',
  skier: 'border-blue-500',
  peacekeeper: 'border-cyan-500',
  mechanic: 'border-orange-500',
  ragman: 'border-purple-500',
  jaeger: 'border-green-500',
  lightkeeper: 'border-yellow-500',
  default: 'border-tarkov-accent',
};

interface TaskNodeProps {
  data: TaskNodeData;
}

function TaskNodeComponent({ data }: TaskNodeProps) {
  const borderColor = traderColors[data.traderId] || traderColors.default;

  const bgClass = data.isCompleted
    ? 'bg-green-900/80 border-green-500'
    : data.isAvailable
    ? `bg-tarkov-bg/90 ${borderColor}`
    : 'bg-gray-800/60 border-gray-600 opacity-60';

  const textClass = data.isCompleted
    ? 'text-green-300 line-through'
    : data.isAvailable
    ? 'text-tarkov-text'
    : 'text-gray-400';

  return (
    <div
      className={`px-3 py-2 rounded-lg border-2 shadow-lg min-w-[140px] max-w-[200px] ${bgClass}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 !bg-tarkov-accent"
      />

      <div className="flex flex-col gap-1">
        <div className={`text-xs font-medium truncate ${textClass}`}>
          {data.name}
        </div>
        <div className="flex items-center justify-between text-[10px] text-gray-400">
          <span>{data.traderName}</span>
          <span>Lv.{data.minPlayerLevel}</span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 !bg-tarkov-accent"
      />
    </div>
  );
}

export const TaskNode = memo(TaskNodeComponent);
