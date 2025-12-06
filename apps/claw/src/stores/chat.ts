import type { LLMAssistant as Assistant, LLMModel } from '@netko/claw-domain'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Chat Store
 *
 * Manages chat-related state including current assistant, LLM model selection,
 * and feature toggles like web search. Persisted to localStorage for a
 * seamless experience across sessions. 🐱
 */

interface ChatState {
  // Current selections
  currentAssistant: Assistant | null
  currentLLMModel: LLMModel | null
  isWebSearchEnabled: boolean

  // Actions
  setCurrentAssistant: (assistant: Assistant | null) => void
  setCurrentLLMModel: (model: LLMModel | null) => void
  setWebSearchEnabled: (enabled: boolean) => void
  reset: () => void
}

const initialState = {
  currentAssistant: null,
  currentLLMModel: null,
  isWebSearchEnabled: false,
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      ...initialState,

      setCurrentAssistant: (assistant) => set({ currentAssistant: assistant }),
      setCurrentLLMModel: (model) => set({ currentLLMModel: model }),
      setWebSearchEnabled: (enabled) => set({ isWebSearchEnabled: enabled }),
      reset: () => set(initialState),
    }),
    {
      name: 'netko-chat-store',
      partialize: (state) => ({
        currentLLMModel: state.currentLLMModel,
        isWebSearchEnabled: state.isWebSearchEnabled,
      }),
    },
  ),
)

// Selector hooks for cleaner component usage
export const useCurrentAssistant = () => useChatStore((s) => s.currentAssistant)
export const useCurrentLLMModel = () => useChatStore((s) => s.currentLLMModel)
export const useWebSearchEnabled = () => useChatStore((s) => s.isWebSearchEnabled)
