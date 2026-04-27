/**
 * Staff Service
 *
 * API calls for managing staff members.
 * Consumed by React Query hooks — never by components directly.
 */

import { apiClient, API_CONFIG } from '@/lib/api'
import type {
  Staff,
  CreateStaffDto,
  UpdateStaffDto,
  StaffFilters,
} from '@booking-app/types'

function buildQueryString(filters: StaffFilters): string {
  const params = new URLSearchParams()
  if (filters.name) params.set('name', filters.name)
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export const staffService = {
  getStaff: (filters: StaffFilters, token: string) => {
    const qs = buildQueryString(filters)
    return apiClient.get<Staff[]>(
      `${API_CONFIG.endpoints.staff.list}${qs}`,
      token,
    )
  },

  getStaffMember: (id: string, token: string) =>
    apiClient.get<Staff>(
      API_CONFIG.endpoints.staff.get(id),
      token,
    ),

  createStaff: (data: CreateStaffDto, token: string) =>
    apiClient.post<Staff>(
      API_CONFIG.endpoints.staff.create,
      data,
      token,
    ),

  updateStaff: (id: string, data: UpdateStaffDto, token: string) =>
    apiClient.patch<Staff>(
      API_CONFIG.endpoints.staff.update(id),
      data,
      token,
    ),

  deleteStaff: (id: string, token: string) =>
    apiClient.delete<void>(
      API_CONFIG.endpoints.staff.delete(id),
      token,
    ),
}
