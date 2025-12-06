import { useQuery } from '@tanstack/react-query'
import { eden } from '@/lib/eden'

/**
 * Auth API Hooks
 *
 * Hooks for authentication-related API calls.
 * Who goes there? Friend or foe? 🐱🔒
 */

// Query keys for cache management
export const authKeys = {
  all: ['auth'] as const,
  methods: () => [...authKeys.all, 'methods'] as const,
  me: () => [...authKeys.all, 'me'] as const,
}

/**
 * Fetch enabled authentication methods
 */
export function useAuthMethods() {
  return useQuery({
    queryKey: authKeys.methods(),
    queryFn: async () => {
      const { data, error } = await eden.api.v1.users['auth-methods'].get()
      if (error) throw error
      return data ?? []
    },
  })
}

/**
 * Fetch current user profile
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const { data, error } = await eden.api.v1.users.me.get()
      if (error) throw error
      return data
    },
  })
}

