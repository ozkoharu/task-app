import { render, screen } from '@testing-library/react';
import Footer from '@/components/layout/Footer';

describe('Footer', () => {
  it('should render the copyright notice', () => {
    render(<Footer />);

    expect(screen.getByText(/Tarkov Task Tracker/)).toBeInTheDocument();
    expect(screen.getByText(/Not affiliated with Battlestate Games/)).toBeInTheDocument();
  });

  it('should display the current year', () => {
    const currentYear = new Date().getFullYear();
    render(<Footer />);

    expect(screen.getByText(new RegExp(`${currentYear}`))).toBeInTheDocument();
  });
});
