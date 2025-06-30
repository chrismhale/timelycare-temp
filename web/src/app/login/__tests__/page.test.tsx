import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '../page';
import { AuthProvider } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Login Page', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  const renderWithProvider = () => {
    return render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );
  };

  it('renders the login form correctly', () => {
    renderWithProvider();
    expect(screen.getByRole('heading', { name: /agent login/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your agent token')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('handles successful login and redirects to dashboard', async () => {
    renderWithProvider();

    fireEvent.change(screen.getByPlaceholderText('Enter your agent token'), {
      target: { value: 'agent-token-123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows an error message on failed login with an incorrect token', async () => {
    renderWithProvider();

    fireEvent.change(screen.getByPlaceholderText('Enter your agent token'), {
      target: { value: 'wrong-token' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText('Invalid token. Please try again.')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
}); 