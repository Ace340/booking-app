/**
 * API Client
 *
 * Generic HTTP client for the backend API.
 * Handles auth tokens, JSON serialization, and error normalisation.
 *
 * No component should call this directly — use the service layer.
 */

import { API_CONFIG } from './config'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RequestOptions {
  method?: HttpMethod
  body?: unknown
  token?: string | null
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Low-level request function.
 * Throws `ApiError` on non-2xx responses so React Query can surface them.
 */
export async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, token } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new ApiError(
      response.status,
      data.message ?? `Request failed with status ${response.status}`,
    )
  }

  return response.json() as Promise<T>
}

/** Convenience helpers — services use these instead of raw `request`. */
export const apiClient = {
  get: <T>(endpoint: string, token?: string | null) =>
    request<T>(endpoint, { method: 'GET', token }),

  post: <T>(endpoint: string, body: unknown, token?: string | null) =>
    request<T>(endpoint, { method: 'POST', body, token }),

  patch: <T>(endpoint: string, body?: unknown, token?: string | null) =>
    request<T>(endpoint, { method: 'PATCH', body, token }),

  put: <T>(endpoint: string, body: unknown, token?: string | null) =>
    request<T>(endpoint, { method: 'PUT', body, token }),

  delete: <T>(endpoint: string, token?: string | null) =>
    request<T>(endpoint, { method: 'DELETE', token }),
}
