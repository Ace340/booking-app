import type { Metadata } from 'next'
import { Sidebar } from '@/components/sidebar/sidebar'

export const metadata: Metadata = {
  title: 'Dashboard | BookingApp',
  description: 'Manage your bookings, appointments, and services',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
