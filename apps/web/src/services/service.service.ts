/**
 * Service Service
 *
 * API calls for managing business services.
 * Consumed by React Query hooks — never by components directly.
 */

import { apiClient, API_CONFIG } from '@/lib/api'
import type {
  Service,
  CreateServiceDto,
  UpdateServiceDto,
  ServiceFilters,
} from '@booking-app/types'

function buildQueryString(filters: ServiceFilters): string {
  const params = new URLSearchParams()
  if (filters.name) params.set('name', filters.name)
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export const serviceService = {
  getServices: (filters: ServiceFilters, token: string) => {
    const qs = buildQueryString(filters)
    return apiClient.get<Service[]>(
      `${API_CONFIG.endpoints.services.list}${qs}`,
      token,
    )
  },

  getService: (id: string, token: string) =>
    apiClient.get<Service>(
      API_CONFIG.endpoints.services.get(id),
      token,
    ),

  createService: (data: CreateServiceDto, token: string) =>
    apiClient.post<Service>(
      API_CONFIG.endpoints.services.create,
      data,
      token,
    ),

  updateService: (id: string, data: UpdateServiceDto, token: string) =>
    apiClient.patch<Service>(
      API_CONFIG.endpoints.services.update(id),
      data,
      token,
    ),

  deleteService: (id: string, token: string) =>
    apiClient.delete<void>(
      API_CONFIG.endpoints.services.delete(id),
      token,
    ),
}
