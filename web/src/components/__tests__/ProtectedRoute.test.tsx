import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProtectedRoute from '../ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

jest.mock('@/context/AuthContext');

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockUseAuth = useAuth as jest.Mock;

describe('ProtectedRoute', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when authenticated', () => {
    mockUseAuth.mockReturnValue({ token: 'abc', isLoading: false });
    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Secret</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows loading state while auth is loading', () => {
    mockUseAuth.mockReturnValue({ token: null, isLoading: true });
    render(
      <ProtectedRoute>
        <div>Hidden</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('redirects to /login when not authenticated', async () => {
    mockUseAuth.mockReturnValue({ token: null, isLoading: false });
    render(
      <ProtectedRoute>
        <div>Hidden</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });
}); 