import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { eden } from '@/lib/eden'

/**
 * BYOK (Bring Your Own Key) API Hooks
 *
 * Hooks for managing user API keys for different providers.
 * Your keys, your rules. We just keep 'em safe. 🔐🐱
 */

// Query keys for cache management
export const byokKeys = {
  all: ['llm-byok'] as const,
  list: () => [...byokKeys.all, 'list'] as const,
}

/**
 * Fetch all BYOK entries for the user
 */
export function useByokKeys() {
  return useQuery({
    queryKey: byokKeys.list(),
    queryFn: async () => {
      const { data, error } = await eden.api.v1['llm-byok'].get()
      if (error) throw error
      return data ?? []
    },
  })
}

/**
 * Create a new BYOK entry
 */
export function useCreateByok() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { provider: string; key: string }) => {
      const { data, error } = await eden.api.v1['llm-byok'].post(params)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: byokKeys.all })
    },
  })
}

/**
 * Update an existing BYOK entry
 */
export function useUpdateByok() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { id: string; key?: string; isActive?: boolean }) => {
      const { id, ...body } = params
      const { data, error } = await eden.api.v1['llm-byok']({ id }).put(body)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: byokKeys.all })
    },
  })
}

/**
 * Delete a BYOK entry
 */
export function useDeleteByok() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await eden.api.v1['llm-byok']({ id }).delete()
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: byokKeys.all })
    },
  })
}

