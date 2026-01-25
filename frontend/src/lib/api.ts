import { TradersResponse, TasksResponse, Task } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

export async function getTraders(): Promise<TradersResponse> {
  return fetchApi<TradersResponse>('/api/traders');
}

export async function getTasks(params?: {
  trader_id?: string;
  search?: string;
}): Promise<TasksResponse> {
  const searchParams = new URLSearchParams();
  if (params?.trader_id) {
    searchParams.set('trader_id', params.trader_id);
  }
  if (params?.search) {
    searchParams.set('search', params.search);
  }
  const query = searchParams.toString();
  return fetchApi<TasksResponse>(`/api/tasks${query ? `?${query}` : ''}`);
}

export async function getTask(taskId: string): Promise<Task> {
  return fetchApi<Task>(`/api/tasks/${taskId}`);
}
