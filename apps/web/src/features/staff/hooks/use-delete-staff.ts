/**
 * useDeleteStaff Hook
 *
 * Deletes a staff member and auto-invalidates the staff list
 * so React Query refetches fresh data.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { staffService } from '@/services'
import { STAFF_KEY } from './use-staff'

export function useDeleteStaff() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const token = await getToken()
      return staffService.deleteStaff(id, token!)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STAFF_KEY] })
    },
  })
}
