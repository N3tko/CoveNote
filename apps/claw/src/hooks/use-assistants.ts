'use client'

import type { LLMAssistant } from '@netko/claw-domain'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { client } from '@/integrations/eden'
import { useAssistantStore } from '@/stores/assistant-store'

/**
 * Hook to manage assistants and assistant selection
 */
export function useAssistants() {
  const { assistants, currentAssistant, setAssistants, setCurrentAssistant } = useAssistantStore()

  // Fetch assistants using Eden Treaty
  const { data: fetchedAssistants, isLoading } = useQuery({
    queryKey: ['assistants'],
    queryFn: async () => {
      const response = await client.api.assistants.get()
      if (response.error) throw new Error('Failed to fetch assistants')
      return response.data
    },
  })

  // Update store when assistants are fetched
  useEffect(() => {
    if (fetchedAssistants) {
      setAssistants(fetchedAssistants)
    }
  }, [fetchedAssistants, setAssistants])

  const selectAssistant = useCallback(
    (assistant: LLMAssistant) => {
      setCurrentAssistant(assistant)
    },
    [setCurrentAssistant],
  )

  return {
    assistants,
    currentAssistant,
    selectAssistant,
    isLoading,
  }
}
