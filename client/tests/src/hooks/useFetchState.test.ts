import { renderHook, act } from '@testing-library/react';
import { useFetchState } from 'hooks/useFetchState';

describe('useFetchState', () => {
  it('should set loading state', () => {
    const { result } = renderHook(() => useFetchState());
    act(() => {
      result.current.setLoading(true);
    });
    expect(result.current.isLoading).toBe(true);
  });

  it('should set error state', () => {
    const { result } = renderHook(() => useFetchState());
    act(() => {
      result.current.setError('error');
    });
    expect(result.current.error).toBe('error');
  });

  it('should set data', () => {
    const { result } = renderHook(() => useFetchState<number[]>());
    act(() => {
      result.current.setData([1, 2, 3]);
    });
    expect(result.current.data).toEqual([1, 2, 3]);
  });

  it('should handle async function (success)', async () => {
    const { result } = renderHook(() => useFetchState<number>());
    await act(async () => {
      await result.current.handle(async () => 42);
    });
    expect(result.current.data).toBe(42);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle async function (error)', async () => {
    const { result } = renderHook(() => useFetchState());
    await act(async () => {
      await result.current.handle(async () => { throw new Error('fail'); });
    });
    expect(result.current.error).toBe('fail');
    expect(result.current.isLoading).toBe(false);
  });

  it('should reset data to initial state when clear is called', () => {
    const { result } = renderHook(() => useFetchState<number[]>([1, 2, 3]));
    act(() => {
      result.current.setData([4, 5, 6]);
    });
    expect(result.current.data).toEqual([4, 5, 6]);
    act(() => {
      result.current.clear();
    });
    expect(result.current.data).toEqual([1, 2, 3]);
  });

  it('should set error to default message if error has no message property', async () => {
    const { result } = renderHook(() => useFetchState());
    await act(async () => {
      await result.current.handle(async () => { throw 'fail'; });
    });
    expect(result.current.error).toBe('Something went wrong');
  });
}); 