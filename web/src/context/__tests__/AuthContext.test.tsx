import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('initializes with no user if localStorage is empty', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toBeNull();
  });

  it('initializes with user from localStorage', async () => {
    const mockUser = { id: 'stored1', name: 'Stored User' };
    localStorage.setItem('user', JSON.stringify(mockUser));
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toEqual(mockUser);
  });

  it('logs in a user, updates state, and stores in localStorage', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    const newUser = { id: 'new1', name: 'New User' };
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    act(() => {
      result.current.login(newUser);
    });

    expect(result.current.user).toEqual(newUser);
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual(newUser);
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('logs out a user, clears state, and removes from localStorage', async () => {
    const mockUser = { id: 'user1', name: 'Existing User' };
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    // Verify user is loaded before logout
    expect(result.current.user).toEqual(mockUser);

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(mockPush).toHaveBeenCalledWith('/login');
  });
}); 