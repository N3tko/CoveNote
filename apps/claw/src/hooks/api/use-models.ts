import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { eden } from '@/lib/eden'

/**
 * LLM Models API Hooks
 *
 * Hooks for managing LLM model configurations.
 * Because one AI just isn't enough anymore. 🐱
 */

// Query keys for cache management
export const modelKeys = {
  all: ['llm-models'] as const,
  available: () => [...modelKeys.all, 'available'] as const,
  active: () => [...modelKeys.all, 'active'] as const,
}

/**
 * Fetch all available LLM models for the user
 */
export function useAvailableModels() {
  return useQuery({
    queryKey: modelKeys.available(),
    queryFn: async () => {
      const { data, error } = await eden.api.v1['llm-models'].available.get()
      if (error) throw error
      return data ?? []
    },
  })
}

/**
 * Fetch all active LLM models for the user
 */
export function useActiveModels() {
  return useQuery({
    queryKey: modelKeys.active(),
    queryFn: async () => {
      const { data, error } = await eden.api.v1['llm-models'].active.get()
      if (error) throw error
      return data ?? []
    },
  })
}

/**
 * Create a new LLM model
 */
export function useCreateModel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      name: string
      displayName: string
      provider: string
      description?: string | null
      isActive?: boolean
    }) => {
      const { data, error } = await eden.api.v1['llm-models'].post(params)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modelKeys.all })
    },
  })
}

/**
 * Update an existing LLM model
 */
export function useUpdateModel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      id: string
      name?: string
      displayName?: string
      provider?: string
      description?: string | null
      isActive?: boolean
      isPublic?: boolean
    }) => {
      const { id, ...body } = params
      const { data, error } = await eden.api.v1['llm-models']({ id }).put(body)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modelKeys.all })
    },
  })
}

/**
 * Delete an LLM model
 */
export function useDeleteModel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await eden.api.v1['llm-models']({ id }).delete()
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modelKeys.all })
    },
  })
}

