/**
 * Auth Service
 *
 * API calls for authentication.
 * Consumed by hooks / stores — never by components directly.
 */

import { apiClient } from '@/lib/api'
import { API_CONFIG } from '@/lib/api'
import type { AuthResponse, LoginDto, RegisterDto } from '@booking-app/types'

export const authService = {
  login: (data: LoginDto) =>
    apiClient.post<AuthResponse>(API_CONFIG.endpoints.auth.login, data),

  register: (data: RegisterDto) =>
    apiClient.post<AuthResponse>(API_CONFIG.endpoints.auth.register, data),
}
