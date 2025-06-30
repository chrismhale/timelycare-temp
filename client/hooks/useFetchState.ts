import { useState, useCallback } from 'react';

export function useFetchState<T>(initialState: T) {
  const [data, setData] = useState<T>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setLoading = useCallback((loadingState: boolean) => {
    setIsLoading(loadingState);
  }, []);

  const handle = useCallback(async (fn: () => Promise<T>) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fn();
      setData(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      // When an error occurs, we should reset the data to
      // to prevent rendering stale or incorrect information.
      setData(initialState); 
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setData(initialState);
  }, [initialState]);

  return { data, setData: useCallback(setData, []), isLoading, setLoading, error, setError: useCallback(setError, []), handle, clear };
}