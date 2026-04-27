/**
 * useCreateStaff Hook
 *
 * Creates a new staff member and auto-invalidates the staff list
 * so React Query refetches fresh data.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { staffService } from '@/services'
import type { CreateStaffDto, Staff } from '@booking-app/types'
import { STAFF_KEY } from './use-staff'

/**
 * @param token - JWT access token
 */
export function useCreateStaff(token: string | null) {
  const queryClient = useQueryClient()

  return useMutation<Staff, Error, CreateStaffDto>({
    mutationFn: (data) => staffService.createStaff(data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STAFF_KEY] })
    },
  })
}
