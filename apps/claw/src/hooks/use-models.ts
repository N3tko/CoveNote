'use client'

import type { LLMModel } from '@netko/claw-domain'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { client } from '@/integrations/eden'
import { useModelStore } from '@/stores/model-store'

/**
 * Hook to manage models and model selection
 */
export function useModels() {
  const { models, currentModel, setModels, setCurrentModel } = useModelStore()

  // Fetch available models using Eden Treaty
  const { data: fetchedModels, isLoading } = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const response = await client.api.models.get()
      if (response.error) throw new Error('Failed to fetch models')
      return response.data
    },
  })

  // Update store when models are fetched
  useEffect(() => {
    if (fetchedModels) {
      setModels(fetchedModels)
    }
  }, [fetchedModels, setModels])

  const selectModel = useCallback(
    (model: LLMModel) => {
      setCurrentModel(model)
    },
    [setCurrentModel],
  )

  return {
    models,
    currentModel,
    selectModel,
    isLoading,
  }
}
