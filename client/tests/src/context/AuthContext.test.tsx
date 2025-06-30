import React, { act } from 'react';
import { renderHook, render } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useApi } from 'hooks/useApi';
import { toast } from 'react-toastify';
import { waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';

jest.mock('hooks/useApi');
jest.mock('react-toastify');

const mockUseApi = useApi as jest.Mock;
const mockToastSuccess = toast.success as jest.Mock;

describe('AuthContext', () => {
  let requestMock: jest.Mock;

  beforeEach(() => {
    requestMock = jest.fn();
    mockUseApi.mockReturnValue({ request: requestMock });
    localStorage.clear();
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('should start with no user or token', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('should log in a user successfully', async () => {
    const mockUserData = { user: { id: '1', name: 'Test' }, token: 'fake-token' };
    requestMock.mockResolvedValue(mockUserData);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@test.com', 'password');
    });

    await waitFor(() => {
      expect(result.current.token).toBe('fake-token');
    });

    expect(requestMock).toHaveBeenCalledWith('/login', expect.any(Object));
    expect(result.current.user?.name).toBe('Test');
    expect(localStorage.getItem('token')).toBe('fake-token');
    expect(mockToastSuccess).toHaveBeenCalledWith('Login successful!');
  });

  it('should not set user/token on failed login', async () => {
    requestMock.mockRejectedValue(new Error('Login failed'));
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('wrong@test.com', 'badpass');
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should handle non-Error exceptions during login', async () => {
    requestMock.mockRejectedValue('A simple string error');
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@test.com', 'password');
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('should handle logout', async () => {
    // First, log in
    const mockUserData = { user: { id: '1', name: 'Test' }, token: 'fake-token' };
    requestMock.mockResolvedValue(mockUserData);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.login('test@test.com', 'password');
    });

    await waitFor(() => expect(result.current.token).not.toBeNull());
    
    // Then, log out
    await act(async () => {
      result.current.logout();
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('throws if useAuth is used outside provider', () => {
    // Suppress expected error output for this test
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
    spy.mockRestore();
  });

  it('handles non-Error exception in login', async () => {
    const requestMock = jest.fn().mockImplementation(() => { throw 'fail'; });
    jest.mock('hooks/useApi', () => ({ useApi: () => ({ request: requestMock }) }));
    let loginFn: any;
    function Dummy() {
      loginFn = useAuth().login;
      return null;
    }
    render(<AuthProvider><Dummy /></AuthProvider>);
    await act(async () => {
      await loginFn('email', 'pass');
    });
    // Should not throw
  });

  it('should not log in if token is missing from response', async () => {
    const mockUserData = { user: { id: '1', name: 'Test' } }; // No token
    requestMock.mockResolvedValue(mockUserData);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@test.com', 'password');
    });

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });
}); 