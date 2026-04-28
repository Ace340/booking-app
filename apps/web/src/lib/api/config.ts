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
      me: '/auth/me',
    },
    bookings: {
      list: '/bookings',
      create: '/bookings',
      cancel: (id: string) => `/bookings/${id}/cancel`,
    },
    services: {
      list: '/services',
      create: '/services',
      get: (id: string) => `/services/${id}`,
      update: (id: string) => `/services/${id}`,
      delete: (id: string) => `/services/${id}`,
    },
    staff: {
      list: '/staff',
      create: '/staff',
      get: (id: string) => `/staff/${id}`,
      update: (id: string) => `/staff/${id}`,
      delete: (id: string) => `/staff/${id}`,
    },
    users: {
      profile: '/users/profile',
      updateProfile: '/users/profile',
      customers: '/users/customers',
      customer: (id: string) => `/users/customers/${id}`,
      list: '/users',
    },
  },
} as const
