import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('Navigation', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
  });

  it('should render Dashboard and Task List links', () => {
    render(<Navigation />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Task List')).toBeInTheDocument();
  });

  it('should highlight active link for Dashboard', () => {
    mockUsePathname.mockReturnValue('/');
    render(<Navigation />);

    const dashboardLink = screen.getByText('Dashboard');
    expect(dashboardLink).toHaveClass('text-tarkov-accent');
  });

  it('should highlight active link for Task List', () => {
    mockUsePathname.mockReturnValue('/tasks');
    render(<Navigation />);

    const taskListLink = screen.getByText('Task List');
    expect(taskListLink).toHaveClass('text-tarkov-accent');
  });
});
