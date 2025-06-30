import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/utils/env";

// Utility to join base URL and path without double slashes
function joinUrl(base: string, path: string) {
  if (!base.endsWith('/') && !path.startsWith('/')) return base + '/' + path;
  if (base.endsWith('/') && path.startsWith('/')) return base + path.slice(1);
  return base + path;
}

export const useApi = () => {
  let logout: () => void = () => {};
  let token: string | null = null;
  try {
    const auth = useAuth();
    logout = auth.logout;
    token = auth.token;
  } catch {
    // useAuth called outside provider – treat as anonymous usage
  }

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
      
      const res = await fetch(joinUrl(API_BASE_URL, url), { ...options, headers });

      if (res.status === 401) {
        toast.error("Session expired. Logging out...");
        logout();
        return;
      }

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      if (options?.successMessage) {
        toast.success(options.successMessage);
      }
      
      return data;
    } catch (err: any) {
      if (err instanceof Error) {
        toast.error(options?.errorMessage || err.message || 'API call failed');
        throw err;
      }
      // If err is not an Error (e.g., string), wrap it into an Error instance for consistency
      const wrappedError = new Error(typeof err === 'string' ? err : 'API call failed');
      toast.error(options?.errorMessage || wrappedError.message);
      throw wrappedError;
    }
  }, [token, logout]);

  return { request };
};
