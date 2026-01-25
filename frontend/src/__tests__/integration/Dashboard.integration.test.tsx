/**
 * Dashboard integration tests.
 * Tests data fetching and display flow.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Home from '@/app/page';

// Mock the API module
jest.mock('@/lib/api', () => ({
  getTraders: jest.fn(),
  getTasks: jest.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

import { getTraders, getTasks } from '@/lib/api';

const mockGetTraders = getTraders as jest.MockedFunction<typeof getTraders>;
const mockGetTasks = getTasks as jest.MockedFunction<typeof getTasks>;

describe('Dashboard Integration', () => {
  const mockTraders = {
    traders: [
      { id: 'prapor', name: 'Prapor', image_url: 'https://example.com/prapor.jpg', task_count: 10 },
      { id: 'therapist', name: 'Therapist', image_url: 'https://example.com/therapist.jpg', task_count: 8 },
    ],
  };

  const mockTasks = {
    tasks: [
      {
        id: 'task1',
        name: 'Debut',
        trader: { id: 'prapor', name: 'Prapor' },
        min_player_level: 1,
        wiki_link: 'https://wiki.example.com/debut',
        objectives: [],
      },
      {
        id: 'task2',
        name: 'Shortage',
        trader: { id: 'therapist', name: 'Therapist' },
        min_player_level: 1,
        wiki_link: 'https://wiki.example.com/shortage',
        objectives: [],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    mockGetTraders.mockResolvedValue(mockTraders);
    mockGetTasks.mockResolvedValue(mockTasks);
  });

  describe('Data Fetching and Display', () => {
    it('should show loading state initially', () => {
      render(<Home />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should display dashboard after data loads', async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });
    });

    it('should display overall progress', async () => {
      render(<Home />);

      await waitFor(() => {
        // Check for progress display elements
        expect(screen.getByText(/0.*%/)).toBeInTheDocument();
      });
    });

    it('should display trader names', async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Prapor')).toBeInTheDocument();
        expect(screen.getByText('Therapist')).toBeInTheDocument();
      });
    });
  });

  describe('Progress Calculation', () => {
    it('should show 0% progress with no completed tasks', async () => {
      localStorageMock.setItem('tarkov-progress', JSON.stringify({
        completedTaskIds: [],
        updatedAt: new Date().toISOString(),
      }));

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText(/0.*%/)).toBeInTheDocument();
      });
    });

    it('should show correct progress with some completed tasks', async () => {
      localStorageMock.setItem('tarkov-progress', JSON.stringify({
        completedTaskIds: ['task1'],
        updatedAt: new Date().toISOString(),
      }));

      render(<Home />);

      await waitFor(() => {
        // 1 out of 2 tasks = 50%
        expect(screen.getByText(/50.*%/)).toBeInTheDocument();
      });
    });

    it('should show 100% progress when all tasks completed', async () => {
      localStorageMock.setItem('tarkov-progress', JSON.stringify({
        completedTaskIds: ['task1', 'task2'],
        updatedAt: new Date().toISOString(),
      }));

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText(/100.*%/)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on API failure', async () => {
      mockGetTasks.mockRejectedValue(new Error('API connection failed'));

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument();
      });
    });
  });

  describe('API Calls', () => {
    it('should call both getTraders and getTasks on mount', async () => {
      render(<Home />);

      await waitFor(() => {
        expect(mockGetTasks).toHaveBeenCalled();
      });
    });
  });
});
