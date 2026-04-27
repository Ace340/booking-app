'use client'

import { APP_NAME, NAV_ITEMS } from '@/lib/constants'
import { SidebarItem } from './sidebar-item'

export function Sidebar() {
  return (
    <aside className="flex flex-col w-64 min-h-screen bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-600 text-white">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="text-lg font-bold text-gray-900">{APP_NAME}</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Dashboard navigation">
        {NAV_ITEMS.map((item) => (
          <SidebarItem key={item.href} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
            <p className="text-xs text-gray-500 truncate">admin@booking.app</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
