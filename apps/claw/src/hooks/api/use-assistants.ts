import { useQuery } from '@tanstack/react-query'
import { eden } from '@/lib/eden'

/**
 * LLM Assistants API Hooks
 *
 * Hooks for fetching available AI assistants.
 * Meet your new AI besties. They don't judge. Much. 🐱
 */

// Query keys for cache management
export const assistantKeys = {
  all: ['llm-assistants'] as const,
  list: () => [...assistantKeys.all, 'list'] as const,
}

/**
 * Fetch all available assistants for the user
 */
export function useAssistants() {
  return useQuery({
    queryKey: assistantKeys.list(),
    queryFn: async () => {
      const { data, error } = await eden.api.v1['llm-assistants'].get()
      if (error) throw error
      return data ?? []
    },
  })
}

