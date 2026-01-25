import { render, screen, fireEvent } from '@testing-library/react';
import TaskItem from '@/components/tasks/TaskItem';
import { Task } from '@/types';

const mockTask: Task = {
  id: 'task-1',
  name: 'Debut',
  trader: { id: 'prapor', name: 'Prapor' },
  min_player_level: 5,
  wiki_link: null,
  objectives: [],
};

describe('TaskItem', () => {
  it('should display task name', () => {
    render(<TaskItem task={mockTask} isCompleted={false} onToggle={jest.fn()} />);

    expect(screen.getByText('Debut')).toBeInTheDocument();
  });

  it('should display player level', () => {
    render(<TaskItem task={mockTask} isCompleted={false} onToggle={jest.fn()} />);

    expect(screen.getByText('Lv.5')).toBeInTheDocument();
  });

  it('should apply completed styles when completed', () => {
    render(<TaskItem task={mockTask} isCompleted={true} onToggle={jest.fn()} />);

    const taskName = screen.getByText('Debut');
    expect(taskName).toHaveClass('line-through');
  });

  it('should call onToggle when checkbox is clicked', () => {
    const onToggle = jest.fn();
    render(<TaskItem task={mockTask} isCompleted={false} onToggle={onToggle} />);

    fireEvent.click(screen.getByRole('button'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
