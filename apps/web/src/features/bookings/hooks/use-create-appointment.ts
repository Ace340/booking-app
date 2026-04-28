/**
 * useCreateAppointment Hook
 *
 * Creates a new appointment and auto-invalidates the appointments list
 * so React Query refetches fresh data.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { bookingService } from '@/services'
import type { CreateAppointmentDto, Appointment } from '@booking-app/types'
import { APPOINTMENTS_KEY } from './use-appointments'

/**
 * @example
 * ```tsx
 * const { mutate: createAppointment, isPending } = useCreateAppointment()
 *
 * createAppointment({ staffId, serviceId, startTime })
 * ```
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation<Appointment, Error, CreateAppointmentDto>({
    mutationFn: async (data) => {
      const token = await getToken()
      return bookingService.createAppointment(data, token!)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] })
    },
  })
}
