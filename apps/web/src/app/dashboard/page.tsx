'use client'

import { StatCard } from '@/components/ui/stat-card'
import { useAppointments } from '@/features/bookings/hooks'
import { useServices } from '@/features/services/hooks'
import { useStaff } from '@/features/staff/hooks'
import { useCustomers } from '@/features/customers/hooks'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export default function DashboardPage() {
  const token = getToken()

  const { data: appointments } = useAppointments({}, token)
  const { data: services } = useServices({}, token)
  const { data: staff } = useStaff({}, token)
  const { data: customers } = useCustomers({}, token)

  const stats = [
    {
      title: 'Total Bookings',
      value: appointments ? String(appointments.length) : '—',
      description: appointments ? `${appointments.length} appointments` : 'No data yet',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Customers',
      value: customers ? String(customers.length) : '—',
      description: customers ? `${customers.length} registered` : 'No data yet',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      title: 'Services',
      value: services ? String(services.length) : '—',
      description: services ? `${services.length} active` : 'No data yet',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Staff',
      value: staff ? String(staff.length) : '—',
      description: staff ? `${staff.length} members` : 'No data yet',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back. Here is an overview of your booking business.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Upcoming Appointments */}
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Upcoming Appointments</h2>
          {appointments && appointments.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {appointments.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(appointment.startTime).toLocaleDateString()} at {new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-gray-500">Customer: {appointment.userId}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700">
                    {appointment.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No upcoming appointments to display.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
