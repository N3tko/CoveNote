import { useTRPC } from '@/integrations/trpc/react'
import { useAssistantStore } from '@/stores'
import type { LLMAssistant } from '@netko/claw-domain'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'

/**
 * Hook for managing assistants with tRPC
 */
export function useAssistants() {
  const trpc = useTRPC()
  
  const {
    assistants,
    currentAssistant,
    isLoading: storeLoading,
    error: storeError,
    setAssistants,
    setCurrentAssistant,
    setLoading,
    setError,
  } = useAssistantStore()

  // Fetch assistants
  const {
    data: fetchedAssistants,
    isLoading: queryLoading,
    error: queryError,
  } = useQuery(trpc.assistants.getAll.queryOptions())

  // Update store when assistants are fetched
  useEffect(() => {
    if (fetchedAssistants) {
      setAssistants(fetchedAssistants)
    }
  }, [fetchedAssistants, setAssistants])

  // Update loading state
  useEffect(() => {
    setLoading(queryLoading)
  }, [queryLoading, setLoading])

  // Update error state
  useEffect(() => {
    if (queryError) {
      setError(queryError.message)
    }
  }, [queryError, setError])

  const selectAssistant = useCallback(
    (assistant: LLMAssistant) => {
      setCurrentAssistant(assistant)
    },
    [setCurrentAssistant],
  )

  return {
    assistants,
    currentAssistant,
    isLoading: storeLoading || queryLoading,
    error: storeError || queryError?.message,
    selectAssistant,
  }
}


