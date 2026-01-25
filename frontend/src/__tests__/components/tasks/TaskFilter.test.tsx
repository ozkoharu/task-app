import { render, screen, fireEvent } from '@testing-library/react';
import TaskFilter from '@/components/tasks/TaskFilter';
import { Trader } from '@/types';

const mockTraders: Trader[] = [
  { id: 'prapor', name: 'Prapor', image_url: null, task_count: 2 },
  { id: 'therapist', name: 'Therapist', image_url: null, task_count: 1 },
];

describe('TaskFilter', () => {
  const defaultProps = {
    traders: mockTraders,
    traderId: 'all',
    status: 'all' as const,
    search: '',
    resultCount: 10,
    onTraderChange: jest.fn(),
    onStatusChange: jest.fn(),
    onSearchChange: jest.fn(),
    onClear: jest.fn(),
  };

  it('should display trader select', () => {
    render(<TaskFilter {...defaultProps} />);

    expect(screen.getByLabelText('Trader')).toBeInTheDocument();
    expect(screen.getByText('All Traders')).toBeInTheDocument();
    expect(screen.getByText('Prapor')).toBeInTheDocument();
    expect(screen.getByText('Therapist')).toBeInTheDocument();
  });

  it('should display status buttons', () => {
    render(<TaskFilter {...defaultProps} />);

    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Incomplete')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('should display search input', () => {
    render(<TaskFilter {...defaultProps} />);

    expect(screen.getByLabelText('Search')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search by task name...')).toBeInTheDocument();
  });

  it('should display result count', () => {
    render(<TaskFilter {...defaultProps} />);

    expect(screen.getByText('10 tasks found')).toBeInTheDocument();
  });

  it('should call onTraderChange when trader is selected', () => {
    const onTraderChange = jest.fn();
    render(<TaskFilter {...defaultProps} onTraderChange={onTraderChange} />);

    fireEvent.change(screen.getByLabelText('Trader'), { target: { value: 'prapor' } });

    expect(onTraderChange).toHaveBeenCalledWith('prapor');
  });

  it('should call onStatusChange when status button is clicked', () => {
    const onStatusChange = jest.fn();
    render(<TaskFilter {...defaultProps} onStatusChange={onStatusChange} />);

    fireEvent.click(screen.getByText('Completed'));

    expect(onStatusChange).toHaveBeenCalledWith('completed');
  });

  it('should call onSearchChange when search input changes', () => {
    const onSearchChange = jest.fn();
    render(<TaskFilter {...defaultProps} onSearchChange={onSearchChange} />);

    fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'debut' } });

    expect(onSearchChange).toHaveBeenCalledWith('debut');
  });

  it('should not show clear button when no filters are applied', () => {
    render(<TaskFilter {...defaultProps} />);

    expect(screen.queryByText('Clear filters')).not.toBeInTheDocument();
  });

  it('should show clear button when filters are applied', () => {
    render(<TaskFilter {...defaultProps} traderId="prapor" />);

    expect(screen.getByText('Clear filters')).toBeInTheDocument();
  });

  it('should call onClear when clear button is clicked', () => {
    const onClear = jest.fn();
    render(<TaskFilter {...defaultProps} traderId="prapor" onClear={onClear} />);

    fireEvent.click(screen.getByText('Clear filters'));

    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
