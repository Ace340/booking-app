/**
 * Query Provider
 *
 * Wraps the app with React Query's QueryClientProvider.
 * Used once in the root layout.
 */

'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import { queryClient } from '@/lib/query-client'

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
