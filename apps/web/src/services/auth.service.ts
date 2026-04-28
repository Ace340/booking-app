/**
 * Auth Service
 *
 * API calls related to the current authenticated user.
 * Clerk handles sign-in/sign-up — this service fetches
 * the user's profile from our backend.
 *
 * Consumed by hooks / stores — never by components directly.
 */

import { apiClient } from '@/lib/api'
import { API_CONFIG } from '@/lib/api'

export interface UserProfile {
  id: string
  clerkId: string
  email: string
  name: string
  role: string
  companyId: string
}

export const authService = {
  /** Get the current user's profile from our backend */
  getProfile: (token: string) =>
    apiClient.get<UserProfile>(API_CONFIG.endpoints.auth.me, token),
}
