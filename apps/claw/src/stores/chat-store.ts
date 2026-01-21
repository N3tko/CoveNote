import type { Chat } from '@netko/claw-domain'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface StreamingState {
  chatId: string
  tempId: string
  content: string
}

interface ChatState {
  // Current chat (persisted)
  currentChatId: string | null
  currentChat: Chat | null

  // Streaming state (not persisted)
  streamingState: StreamingState | null

  // Actions
  setCurrentChat: (chat: Chat) => void
  updateStreamingContent: (chatId: string, tempId: string, content: string) => void
  finalizeStreaming: () => void
  clearStreaming: () => void
}

const initialState = {
  currentChatId: null,
  currentChat: null,
  streamingState: null,
}

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setCurrentChat: (chat) =>
          set(
            {
              currentChatId: chat.id,
              currentChat: chat,
            },
            false,
            'setCurrentChat',
          ),

        updateStreamingContent: (chatId, tempId, content) =>
          set(
            {
              streamingState: { chatId, tempId, content },
            },
            false,
            'updateStreamingContent',
          ),

        finalizeStreaming: () =>
          set(
            {
              streamingState: null,
            },
            false,
            'finalizeStreaming',
          ),

        clearStreaming: () =>
          set(
            {
              streamingState: null,
            },
            false,
            'clearStreaming',
          ),
      }),
      {
        name: 'chat-store',
        // Only persist static data
        partialize: (state) => ({
          currentChatId: state.currentChatId,
          currentChat: state.currentChat,
        }),
      },
    ),
    {
      name: 'ChatStore',
    },
  ),
)
