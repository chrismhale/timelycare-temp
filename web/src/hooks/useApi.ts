import { useCallback } from 'react';
import { useAuth } from "@/context/AuthContext";

// Utility to join base URL and path without double slashes
function joinUrl(base: string, path: string) {
  if (!base.endsWith('/') && !path.startsWith('/')) return base + '/' + path;
  if (base.endsWith('/') && path.startsWith('/')) return base + path.slice(1);
  return base + path;
}

export const useApi = () => {
  const { logout, token } = useAuth() || {};

  const request = useCallback(async (
    url: string,
    options: RequestInit & { successMessage?: string; errorMessage?: string } = {}
  ) => {
    try {
      const headers = new Headers(options.headers);
      headers.append('Content-Type', 'application/json');

      if (token && !headers.has('Authorization')) {
        headers.append('Authorization', `Bearer ${token}`);
      }
      
      const res = await fetch(joinUrl(process.env.NEXT_PUBLIC_API_URL!, url), { ...options, headers });

      if (res.status === 401 && logout) {
        console.error("Session expired. Logging out...");
        logout();
        return;
      }

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      if (options?.successMessage) {
        console.log(options.successMessage);
      }
      
      return data;
    } catch (err: any) {
      if (err instanceof Error) {
        console.error(options?.errorMessage || err.message || 'API call failed');
        throw err;
      }
      // If err is not an Error (e.g., string), wrap it into an Error instance for consistency
      const wrappedError = new Error(typeof err === 'string' ? err : 'API call failed');
      console.error(options?.errorMessage || wrappedError.message);
      throw wrappedError;
    }
  }, [token, logout]);

  return { request };
};
