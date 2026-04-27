'use client'

import { useState } from 'react'
import { useAppointments } from '@/features/bookings/hooks'
import { AppointmentStatus } from '@booking-app/types'
import type { AppointmentFilters } from '@booking-app/types'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

type FilterOption = 'All' | AppointmentStatus

const FILTER_OPTIONS: FilterOption[] = ['All', AppointmentStatus.SCHEDULED, AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED]

function getStatusBadgeClasses(status: AppointmentStatus): string {
  switch (status) {
    case AppointmentStatus.SCHEDULED:
      return 'bg-blue-100 text-blue-700'
    case AppointmentStatus.COMPLETED:
      return 'bg-green-100 text-green-700'
    case AppointmentStatus.CANCELLED:
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export default function AppointmentsPage() {
  const token = getToken()
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All')

  const filters: AppointmentFilters = activeFilter === 'All'
    ? {}
    : { status: activeFilter as AppointmentStatus }

  const { data: appointments, isLoading, error } = useAppointments(filters, token)

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all your bookings.
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="mb-6 flex items-center gap-3">
        {FILTER_OPTIONS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeFilter === filter
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter === 'All' ? 'All' : filter.charAt(0) + filter.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <p className="text-center text-sm text-gray-500">Loading appointments...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-12">
          <p className="text-center text-sm text-red-600">Failed to load appointments. Please try again.</p>
        </div>
      )}

      {/* Data Table */}
      {appointments && appointments.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {appointment.userId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {appointment.staffId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {appointment.serviceId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(appointment.startTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClasses(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {appointments && appointments.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <svg className="mx-auto w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No appointments</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new appointment.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
