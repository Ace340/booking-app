export const APP_NAME = 'BookingApp'

export interface NavItem {
  label: string
  href: string
  icon: string
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'home' },
  { label: 'Appointments', href: '/dashboard/appointments', icon: 'calendar' },
  { label: 'Customers', href: '/dashboard/customers', icon: 'users' },
  { label: 'Services', href: '/dashboard/services', icon: 'briefcase' },
  { label: 'Staff', href: '/dashboard/staff', icon: 'team' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'settings' },
]
