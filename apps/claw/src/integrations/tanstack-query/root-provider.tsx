import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type * as React from 'react'

// Singleton QueryClient for SSR
let clientQueryClient: QueryClient | undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always create a new QueryClient
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 1 minute
        },
      },
    })
  }

  // Browser: use singleton pattern to avoid re-creating between renders
  if (!clientQueryClient) {
    clientQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
        },
      },
    })
  }
  return clientQueryClient
}

export function getContext() {
  const queryClient = getQueryClient()
  return {
    queryClient,
  }
}

export function Provider({
  children,
  queryClient,
}: {
  children: React.ReactNode
  queryClient: QueryClient
}) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
