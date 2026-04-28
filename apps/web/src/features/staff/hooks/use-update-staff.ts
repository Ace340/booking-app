/**
 * useUpdateStaff Hook
 *
 * Updates an existing staff member and auto-invalidates the staff list
 * so React Query refetches fresh data.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { staffService } from '@/services'
import type { UpdateStaffDto, Staff } from '@booking-app/types'
import { STAFF_KEY } from './use-staff'

interface UpdateStaffVariables {
  id: string
  data: UpdateStaffDto
}

export function useUpdateStaff() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation<Staff, Error, UpdateStaffVariables>({
    mutationFn: async ({ id, data }) => {
      const token = await getToken()
      return staffService.updateStaff(id, data, token!)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STAFF_KEY] })
    },
  })
}
