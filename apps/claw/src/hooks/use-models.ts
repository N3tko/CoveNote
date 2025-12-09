import { useTRPC } from '@/integrations/trpc/react'
import { useModelStore } from '@/stores'
import type { LLMModel } from '@netko/claw-domain'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'

/**
 * Hook for managing LLM models with tRPC
 */
export function useModels() {
  const trpc = useTRPC()
  
  const {
    models,
    currentModel,
    isLoading: storeLoading,
    error: storeError,
    setModels,
    setCurrentModel,
    setLoading,
    setError,
  } = useModelStore()

  // Fetch available models for the user
  const {
    data: fetchedModels,
    isLoading: queryLoading,
    error: queryError,
  } = useQuery(trpc.llmModels.getAvailable.queryOptions())

  // Update store when models are fetched
  useEffect(() => {
    if (fetchedModels) {
      setModels(fetchedModels)
    }
  }, [fetchedModels, setModels])

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

  const selectModel = useCallback(
    (model: LLMModel) => {
      setCurrentModel(model)
    },
    [setCurrentModel],
  )

  return {
    models,
    currentModel,
    isLoading: storeLoading || queryLoading,
    error: storeError || queryError?.message,
    selectModel,
  }
}

