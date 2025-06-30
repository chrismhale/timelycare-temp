import { renderHook, act } from '@testing-library/react';
import { useApi } from 'hooks/useApi';
import { AuthProvider } from '@/context/AuthContext';
import { toast } from 'react-toastify';

jest.mock('react-toastify', () => ({
  toast: { error: jest.fn(), success: jest.fn() }
}));

const mockLogout = jest.fn();
jest.mock('@/context/AuthContext', () => {
  const actual = jest.requireActual('@/context/AuthContext');
  return {
    ...actual,
    useAuth: () => ({ token: 'token', logout: mockLogout })
  };
});

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
    })
  );
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('useApi', () => {
  it('should handle errors and set error state (Error object)', async () => {
    const { result } = renderHook(() => useApi(), { wrapper });
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('Test error')));
    await expect(result.current.request('/test')).rejects.toThrow('Test error');
  });

  it('should handle errors and set error state (non-Error)', async () => {
    const { result } = renderHook(() => useApi(), { wrapper });
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.reject('fail'));
    await expect(result.current.request('/test')).rejects.toThrow('fail');
  });

  it('should handle 401 response and call logout', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 401,
      text: () => Promise.resolve(''),
      ok: false
    });
    const { result } = renderHook(() => useApi(), { wrapper });
    const res = await result.current.request('/test');
    expect(toast.error).toHaveBeenCalledWith('Session expired. Logging out...');
    expect(mockLogout).toHaveBeenCalled();
    expect(res).toBeUndefined();
  });

  it('should handle non-401 error response and throw', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 500,
      text: () => Promise.resolve(JSON.stringify({ message: 'Server error' })),
      ok: false
    });
    const { result } = renderHook(() => useApi(), { wrapper });
    await expect(result.current.request('/test')).rejects.toThrow('Server error');
    expect(toast.error).toHaveBeenCalledWith('Server error');
    expect(mockLogout).not.toHaveBeenCalled();
  });

  it('should return an empty object for empty successful responses', async () => {
    // The default fetch mock returns an empty text body
    const { result } = renderHook(() => useApi(), { wrapper });
    const response = await result.current.request('/test');
    expect(response).toEqual({});
  });

  it('should handle non-2xx response with no error message in body', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 500,
      text: () => Promise.resolve(JSON.stringify({})), // empty object
      ok: false
    });
    const { result } = renderHook(() => useApi(), { wrapper });
    await expect(result.current.request('/test')).rejects.toThrow('An error occurred');
    expect(toast.error).toHaveBeenCalledWith('An error occurred');
  });
}); 