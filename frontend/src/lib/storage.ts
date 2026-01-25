import { ProgressData } from '@/types';

const STORAGE_KEY = 'tarkov-progress';

export function getProgress(): ProgressData {
  if (typeof window === 'undefined') {
    return { completedTaskIds: [], updatedAt: new Date().toISOString() };
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return { completedTaskIds: [], updatedAt: new Date().toISOString() };
    }
    return JSON.parse(data) as ProgressData;
  } catch {
    return { completedTaskIds: [], updatedAt: new Date().toISOString() };
  }
}

export function saveProgress(data: ProgressData): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    console.error('Failed to save progress to localStorage');
  }
}

export function clearProgress(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    console.error('Failed to clear progress from localStorage');
  }
}
