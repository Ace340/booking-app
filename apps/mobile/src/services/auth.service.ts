/**
 * Auth Service (Mobile)
 *
 * API calls for authentication using the shared api-client.
 * Unwraps ApiResponse envelope so consumers receive clean data.
 * Consumed by stores / hooks — never by components directly.
 */

import { apiService } from './api-client'
import type { AuthResponse, LoginDto, RegisterDto } from '@booking-app/types'

const ENDPOINTS = {
  login: '/auth/login',
  register: '/auth/register',
} as const

export const authService = {
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await apiService.post<AuthResponse>(ENDPOINTS.login, data)
    if (!response.success || !response.data) {
      throw new Error(response.error ?? 'Login failed')
    }
    return response.data
  },

  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await apiService.post<AuthResponse>(
      ENDPOINTS.register,
      data,
    )
    if (!response.success || !response.data) {
      throw new Error(response.error ?? 'Registration failed')
    }
    return response.data
  },
}
