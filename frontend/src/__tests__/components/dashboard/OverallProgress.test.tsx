import { render, screen } from '@testing-library/react';
import OverallProgress from '@/components/dashboard/OverallProgress';

describe('OverallProgress', () => {
  it('should display the title', () => {
    render(<OverallProgress total={100} completed={50} />);

    expect(screen.getByText('Overall Progress')).toBeInTheDocument();
  });

  it('should display percentage correctly', () => {
    render(<OverallProgress total={100} completed={50} />);

    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should display completion count', () => {
    render(<OverallProgress total={100} completed={50} />);

    expect(screen.getByText('50 / 100 tasks completed')).toBeInTheDocument();
  });

  it('should handle zero total tasks', () => {
    render(<OverallProgress total={0} completed={0} />);

    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('0 / 0 tasks completed')).toBeInTheDocument();
  });

  it('should round percentage correctly', () => {
    render(<OverallProgress total={3} completed={1} />);

    expect(screen.getByText('33%')).toBeInTheDocument();
  });
});
