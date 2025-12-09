import type { LLMModel } from '@netko/claw-domain'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface ModelState {
  // Models
  models: LLMModel[]
  currentModel: LLMModel | null
  
  // UI state
  isLoading: boolean
  error: string | null
  
  // Actions
  setModels: (models: LLMModel[]) => void
  setCurrentModel: (model: LLMModel) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  models: [],
  currentModel: null,
  isLoading: false,
  error: null,
}

export const useModelStore = create<ModelState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setModels: (models) =>
          set(
            (state) => ({
              models,
              // If no current model, set the first one
              currentModel: state.currentModel || models[0] || null,
            }),
            false,
            'setModels',
          ),

        setCurrentModel: (model) =>
          set(
            {
              currentModel: model,
            },
            false,
            'setCurrentModel',
          ),

        setLoading: (isLoading) =>
          set(
            {
              isLoading,
            },
            false,
            'setLoading',
          ),

        setError: (error) =>
          set(
            {
              error,
            },
            false,
            'setError',
          ),

        reset: () =>
          set(
            {
              ...initialState,
            },
            false,
            'reset',
          ),
      }),
      {
        name: 'model-store',
        partialize: (state) => ({
          currentModel: state.currentModel,
        }),
      },
    ),
    {
      name: 'ModelStore',
    },
  ),
)


