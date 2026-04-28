import { getClerkInstance } from '@clerk/expo';
import type { ApiResponse } from '@booking-app/types';

const API_BASE_URL = __DEV__ ? 'http://localhost:3001' : 'https://api.bookingapp.com';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
}

/**
 * Get the current Clerk session token.
 * Returns null if not signed in.
 */
async function getClerkToken(): Promise<string | null> {
  try {
    const clerk = getClerkInstance();
    const token = await clerk.session?.getToken();
    return token ?? null;
  } catch {
    return null;
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { method = 'GET', body } = options;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Auto-attach Clerk token
    const token = await getClerkToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Request failed' };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export const apiService = {
  get: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'POST', body }),

  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};
