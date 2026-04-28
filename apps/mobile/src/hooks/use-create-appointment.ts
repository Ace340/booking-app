/**
 * useCreateAppointment Hook (Mobile)
 *
 * Creates an appointment and auto-invalidates the appointments cache.
 * The api-client auto-attaches Clerk tokens.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingService } from '../services'
import type { CreateAppointmentDto, Appointment } from '@booking-app/types'
import { APPOINTMENTS_KEY } from './use-appointments'

export function useCreateAppointment() {
  const queryClient = useQueryClient()

  return useMutation<Appointment, Error, CreateAppointmentDto>({
    mutationFn: (data) => bookingService.createAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] })
    },
  })
}
