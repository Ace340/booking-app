import type { ApiResponse } from '@booking-app/types';

const API_BASE_URL = __DEV__ ? 'http://localhost:3001' : 'https://api.bookingapp.com';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { method = 'GET', body, token } = options;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

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
  get: <T>(endpoint: string, token?: string | null) =>
    request<T>(endpoint, { method: 'GET', token }),

  post: <T>(endpoint: string, body: unknown, token?: string | null) =>
    request<T>(endpoint, { method: 'POST', body, token }),

  put: <T>(endpoint: string, body: unknown, token?: string | null) =>
    request<T>(endpoint, { method: 'PUT', body, token }),

  patch: <T>(endpoint: string, body: unknown, token?: string | null) =>
    request<T>(endpoint, { method: 'PATCH', body, token }),

  delete: <T>(endpoint: string, token?: string | null) =>
    request<T>(endpoint, { method: 'DELETE', token }),
};
