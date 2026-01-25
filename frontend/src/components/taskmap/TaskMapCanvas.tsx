'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeTypes,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { TaskNode as TaskNodeType, TaskEdge as TaskEdgeType } from '@/types';
import { TaskNode, TaskNodeData } from './TaskNode';
import { getLayoutedElements } from './layoutUtils';

interface TaskMapCanvasProps {
  nodes: TaskNodeType[];
  edges: TaskEdgeType[];
  completedTaskIds: string[];
  onTaskClick?: (taskId: string) => void;
  onTaskDoubleClick?: (taskId: string) => void;
}

const nodeTypes: NodeTypes = {
  taskNode: TaskNode,
};

export function TaskMapCanvas({
  nodes: rawNodes,
  edges: rawEdges,
  completedTaskIds,
  onTaskClick,
  onTaskDoubleClick,
}: TaskMapCanvasProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Build the set of available tasks (all prerequisites completed)
  const availableTaskIds = useMemo(() => {
    const completedSet = new Set(completedTaskIds);
    const available = new Set<string>();

    rawNodes.forEach((node) => {
      const prereqs = node.prerequisite_task_ids || [];
      const allPrereqsCompleted = prereqs.every((id) => completedSet.has(id));
      if (allPrereqsCompleted && !completedSet.has(node.id)) {
        available.add(node.id);
      }
    });

    return available;
  }, [rawNodes, completedTaskIds]);

  // Convert to React Flow nodes
  const initialNodes: Node<TaskNodeData>[] = useMemo(() => {
    return rawNodes.map((node) => ({
      id: node.id,
      type: 'taskNode',
      position: { x: 0, y: 0 },
      data: {
        id: node.id,
        name: node.name,
        traderName: node.trader_name,
        traderId: node.trader_id,
        minPlayerLevel: node.min_player_level,
        wikiLink: node.wiki_link,
        isCompleted: completedTaskIds.includes(node.id),
        isAvailable: availableTaskIds.has(node.id),
      },
    }));
  }, [rawNodes, completedTaskIds, availableTaskIds]);

  // Convert to React Flow edges
  const initialEdges: Edge[] = useMemo(() => {
    const completedSet = new Set(completedTaskIds);

    return rawEdges.map((edge) => {
      const isCompleted = completedSet.has(edge.from) && completedSet.has(edge.to);
      const isPartiallyCompleted = completedSet.has(edge.from);

      return {
        id: `${edge.from}-${edge.to}`,
        source: edge.from,
        target: edge.to,
        type: 'smoothstep',
        animated: isPartiallyCompleted && !isCompleted,
        style: {
          stroke: isCompleted
            ? '#22c55e'
            : isPartiallyCompleted
            ? '#eab308'
            : '#6b7280',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isCompleted
            ? '#22c55e'
            : isPartiallyCompleted
            ? '#eab308'
            : '#6b7280',
        },
      };
    });
  }, [rawEdges, completedTaskIds]);

  // Apply layout
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    return getLayoutedElements(initialNodes, initialEdges, 'LR');
  }, [initialNodes, initialEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedTaskId(node.id);
      onTaskClick?.(node.id);
    },
    [onTaskClick]
  );

  const handleNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onTaskDoubleClick?.(node.id);
    },
    [onTaskDoubleClick]
  );

  // Calculate stats
  const stats = useMemo(() => {
    const total = rawNodes.length;
    const completed = completedTaskIds.filter((id) =>
      rawNodes.some((n) => n.id === id)
    ).length;
    const available = availableTaskIds.size;
    return { total, completed, available };
  }, [rawNodes, completedTaskIds, availableTaskIds]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        className="bg-tarkov-darker"
      >
        <Background color="#334155" gap={20} />
        <Controls className="!bg-tarkov-bg !border-tarkov-border" />
        <MiniMap
          className="!bg-tarkov-bg !border-tarkov-border"
          nodeColor={(node) => {
            const data = node.data as TaskNodeData;
            if (data.isCompleted) return '#22c55e';
            if (data.isAvailable) return '#c9a959';
            return '#6b7280';
          }}
          maskColor="rgba(0, 0, 0, 0.8)"
        />
        <Panel position="top-left" className="bg-tarkov-bg/90 p-3 rounded-lg border border-tarkov-border">
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span className="text-green-400">Completed: {stats.completed}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-tarkov-accent"></div>
              <span className="text-tarkov-accent">Available: {stats.available}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gray-500"></div>
              <span className="text-gray-400">Locked: {stats.total - stats.completed - stats.available}</span>
            </div>
            <div className="border-t border-tarkov-border pt-1 mt-1">
              <span className="text-tarkov-text">Total: {stats.total}</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
