/**
 * Auth Service (Mobile)
 *
 * API calls related to the current authenticated user.
 * Clerk handles sign-in/sign-up — this service fetches
 * the user's profile from our backend.
 *
 * The api-client auto-attaches Clerk tokens.
 * Consumed by stores / hooks — never by components directly.
 */

import { apiService } from './api-client';

export interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  role: string;
  companyId: string;
}

const ENDPOINTS = {
  me: '/auth/me',
} as const;

export const authService = {
  /** Get current user profile from our backend */
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiService.get<UserProfile>(ENDPOINTS.me);
    if (!response.success || !response.data) {
      throw new Error(response.error ?? 'Failed to fetch profile');
    }
    return response.data;
  },
};
