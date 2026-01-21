'use client'

import type { LLMModel } from '@netko/claw-domain'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { client } from '@/integrations/eden'

/**
 * Hook to validate if user has BYOK configured for a model's provider
 */
export function useByokValidation(model: LLMModel | null) {
  // Fetch user's BYOK configurations using Eden Treaty
  const { data: byoks = [] } = useQuery({
    queryKey: ['byok'],
    queryFn: async () => {
      const response = await client.api.byok.get()
      if (response.error) throw new Error('Failed to fetch BYOK configurations')
      return response.data
    },
  })

  // Check if user has BYOK for the model's provider
  const validation = useMemo(() => {
    if (!model) {
      return {
        isValid: false,
        hasApiKey: false,
        provider: null,
        message: 'Please select a model',
      }
    }

    const hasApiKey = byoks.some((byok) => byok.provider === model.provider && byok.isActive)

    return {
      isValid: hasApiKey,
      hasApiKey,
      provider: model.provider,
      message: hasApiKey
        ? 'API key configured'
        : `Please configure your ${model.provider.toUpperCase()} API key in settings`,
    }
  }, [model, byoks])

  return validation
}
