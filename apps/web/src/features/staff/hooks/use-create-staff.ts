/**
 * useCreateStaff Hook
 *
 * Creates a new staff member and auto-invalidates the staff list
 * so React Query refetches fresh data.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { staffService } from '@/services'
import type { CreateStaffDto, Staff } from '@booking-app/types'
import { STAFF_KEY } from './use-staff'

export function useCreateStaff() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation<Staff, Error, CreateStaffDto>({
    mutationFn: async (data) => {
      const token = await getToken()
      return staffService.createStaff(data, token!)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STAFF_KEY] })
    },
  })
}
