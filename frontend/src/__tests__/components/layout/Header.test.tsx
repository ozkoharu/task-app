import { render, screen } from '@testing-library/react';
import Header from '@/components/layout/Header';

describe('Header', () => {
  it('should render the title', () => {
    render(<Header />);

    expect(screen.getByText('Tarkov Task Tracker')).toBeInTheDocument();
  });

  it('should have a link to home page', () => {
    render(<Header />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/');
  });
});
