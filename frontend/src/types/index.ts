export interface Trader {
  id: string;
  name: string;
  image_url: string | null;
  task_count: number;
}

export interface TradersResponse {
  traders: Trader[];
}

export interface TraderBrief {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  image_url: string | null;
}

export interface TaskObjective {
  id: string;
  type: string;
  description: string | null;
  item: Item | null;
  count: number;
  found_in_raid: boolean;
}

export interface Task {
  id: string;
  name: string;
  trader: TraderBrief;
  min_player_level: number;
  wiki_link: string | null;
  objectives: TaskObjective[];
  prerequisite_task_ids: string[];
}

export interface TasksResponse {
  tasks: Task[];
}

export interface ProgressData {
  completedTaskIds: string[];
  updatedAt: string;
}

// Task dependency graph types
export interface TaskNode {
  id: string;
  name: string;
  trader_id: string;
  trader_name: string;
  min_player_level: number;
  wiki_link: string | null;
  prerequisite_task_ids: string[];
}

export interface TaskEdge {
  from: string;
  to: string;
}

export interface TaskDependenciesResponse {
  nodes: TaskNode[];
  edges: TaskEdge[];
}
