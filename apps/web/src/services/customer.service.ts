/**
 * Customer Service
 *
 * API calls for managing customers.
 * Consumed by React Query hooks — never by components directly.
 */

import { apiClient, API_CONFIG } from '@/lib/api'
import type { User, CustomerFilters } from '@booking-app/types'

function buildQueryString(filters: CustomerFilters): string {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export const customerService = {
  getCustomers: (filters: CustomerFilters, token: string) => {
    const qs = buildQueryString(filters)
    return apiClient.get<User[]>(
      `${API_CONFIG.endpoints.users.customers}${qs}`,
      token,
    )
  },

  getCustomer: (id: string, token: string) =>
    apiClient.get<User>(
      API_CONFIG.endpoints.users.customer(id),
      token,
    ),
}
