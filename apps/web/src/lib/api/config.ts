/**
 * API Configuration
 *
 * Centralized API settings. Reads base URL from environment
 * with a sensible localhost default for development.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
    },
    bookings: {
      list: '/bookings',
      create: '/bookings',
      cancel: (id: string) => `/bookings/${id}/cancel`,
    },
  },
} as const
