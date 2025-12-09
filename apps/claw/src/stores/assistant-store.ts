import type { LLMAssistant } from '@netko/claw-domain'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface AssistantState {
  // Assistants
  assistants: LLMAssistant[]
  currentAssistant: LLMAssistant | null
  
  // UI state
  isLoading: boolean
  error: string | null
  
  // Actions
  setAssistants: (assistants: LLMAssistant[]) => void
  setCurrentAssistant: (assistant: LLMAssistant) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  assistants: [],
  currentAssistant: null,
  isLoading: false,
  error: null,
}

export const useAssistantStore = create<AssistantState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setAssistants: (assistants) =>
          set(
            (state) => ({
              assistants,
              // If no current assistant, set the first one
              currentAssistant: state.currentAssistant || assistants[0] || null,
            }),
            false,
            'setAssistants',
          ),

        setCurrentAssistant: (assistant) =>
          set(
            {
              currentAssistant: assistant,
            },
            false,
            'setCurrentAssistant',
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
        name: 'assistant-store',
        partialize: (state) => ({
          currentAssistant: state.currentAssistant,
        }),
      },
    ),
    {
      name: 'AssistantStore',
    },
  ),
)


