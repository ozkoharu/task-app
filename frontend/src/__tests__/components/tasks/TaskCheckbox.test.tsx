import { render, screen, fireEvent } from '@testing-library/react';
import TaskCheckbox from '@/components/tasks/TaskCheckbox';

describe('TaskCheckbox', () => {
  it('should render unchecked state', () => {
    const onChange = jest.fn();
    render(<TaskCheckbox checked={false} onChange={onChange} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Mark as complete');
  });

  it('should render checked state', () => {
    const onChange = jest.fn();
    render(<TaskCheckbox checked={true} onChange={onChange} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Mark as incomplete');
  });

  it('should call onChange when clicked', () => {
    const onChange = jest.fn();
    render(<TaskCheckbox checked={false} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button'));

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('should show checkmark when checked', () => {
    const onChange = jest.fn();
    const { container } = render(<TaskCheckbox checked={true} onChange={onChange} />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should not show checkmark when unchecked', () => {
    const onChange = jest.fn();
    const { container } = render(<TaskCheckbox checked={false} onChange={onChange} />);

    const svg = container.querySelector('svg');
    expect(svg).not.toBeInTheDocument();
  });
});
