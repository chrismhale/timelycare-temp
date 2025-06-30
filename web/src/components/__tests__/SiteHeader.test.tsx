import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SiteHeader from '../SiteHeader';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

// Mock the necessary hooks
jest.mock('@/context/AuthContext');
jest.mock('next/navigation');

const mockUseAuth = useAuth as jest.Mock;
const mockUsePathname = usePathname as jest.Mock;

describe('SiteHeader component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockUseAuth.mockClear();
    mockUsePathname.mockClear();
  });

  it('renders the site title and home link', () => {
    mockUseAuth.mockReturnValue({ token: null });
    mockUsePathname.mockReturnValue('/');
    render(<SiteHeader />);
    const titleLink = screen.getByRole('link', { name: /properview/i });
    expect(titleLink).toBeInTheDocument();
    expect(titleLink).toHaveAttribute('href', '/');
  });

  it('shows Login link when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ token: null });
    mockUsePathname.mockReturnValue('/');
    render(<SiteHeader />);
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
  });

  it('shows Logout button when user is authenticated', () => {
    const mockLogout = jest.fn();
    mockUseAuth.mockReturnValue({ token: 'fake-token', logout: mockLogout });
    mockUsePathname.mockReturnValue('/');
    render(<SiteHeader />);
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /login/i })).not.toBeInTheDocument();
  });

  it('calls logout function when logout button is clicked', () => {
    const mockLogout = jest.fn();
    mockUseAuth.mockReturnValue({ token: 'fake-token', logout: mockLogout });
    mockUsePathname.mockReturnValue('/dashboard');
    render(<SiteHeader />);
    fireEvent.click(screen.getByRole('button', { name: /logout/i }));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('highlights the active navigation link', () => {
    mockUseAuth.mockReturnValue({ token: 'fake-token' });
    mockUsePathname.mockReturnValue('/dashboard');
    render(<SiteHeader />);

    const homeLink = screen.getByRole('link', { name: 'Home' });
    const dashboardLink = screen.getByRole('link', { name: 'Agent Dashboard' });

    expect(homeLink).not.toHaveClass('font-bold');
    expect(dashboardLink).toHaveClass('font-bold', 'underline', 'text-yellow-300');
  });

  it('highlights the login link when active', () => {
    mockUseAuth.mockReturnValue({ token: null });
    mockUsePathname.mockReturnValue('/login');
    render(<SiteHeader />);
    const loginLink = screen.getByRole('link', { name: 'Login' });
    expect(loginLink).toHaveClass('font-bold', 'underline', 'text-yellow-300');
  });
}); 