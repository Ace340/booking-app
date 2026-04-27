/**
 * useUpdateStaff Hook
 *
 * Updates an existing staff member and auto-invalidates the staff list
 * so React Query refetches fresh data.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { staffService } from '@/services'
import type { UpdateStaffDto, Staff } from '@booking-app/types'
import { STAFF_KEY } from './use-staff'

interface UpdateStaffVariables {
  id: string
  data: UpdateStaffDto
}

/**
 * @param token - JWT access token
 */
export function useUpdateStaff(token: string | null) {
  const queryClient = useQueryClient()

  return useMutation<Staff, Error, UpdateStaffVariables>({
    mutationFn: ({ id, data }) => staffService.updateStaff(id, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STAFF_KEY] })
    },
  })
}
