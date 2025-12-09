import type { Chat, ChatMessage } from '@netko/claw-domain'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface MessageState {
  id: string
  content: string
  isStreaming: boolean
  error?: string
}

interface ChatState {
  // Current chat
  currentChatId: string | null
  currentChat: Chat | null
  
  // Messages
  messages: ChatMessage[]
  streamingMessages: Map<string, MessageState>
  
  // UI state
  status: 'idle' | 'loading' | 'streaming' | 'error'
  error: string | null
  
  // Actions
  setCurrentChat: (chat: Chat) => void
  setMessages: (messages: ChatMessage[]) => void
  addMessage: (message: ChatMessage) => void
  updateMessage: (messageId: string, content: string) => void
  setStreamingMessage: (messageId: string, content: string) => void
  completeStreamingMessage: (messageId: string, finalMessage: ChatMessage) => void
  removeStreamingMessage: (messageId: string) => void
  setStatus: (status: ChatState['status']) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  currentChatId: null,
  currentChat: null,
  messages: [],
  streamingMessages: new Map<string, MessageState>(),
  status: 'idle' as const,
  error: null,
}

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set, get) => ({
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

        setMessages: (messages) =>
          set(
            {
              messages,
            },
            false,
            'setMessages',
          ),

        addMessage: (message) =>
          set(
            (state) => ({
              messages: [...state.messages, message],
            }),
            false,
            'addMessage',
          ),

        updateMessage: (messageId, content) =>
          set(
            (state) => ({
              messages: state.messages.map((msg) =>
                msg.id === messageId ? { ...msg, content } : msg,
              ),
            }),
            false,
            'updateMessage',
          ),

        setStreamingMessage: (messageId, content) =>
          set(
            (state) => {
              const newStreamingMessages = new Map(state.streamingMessages)
              newStreamingMessages.set(messageId, {
                id: messageId,
                content,
                isStreaming: true,
              })
              return {
                streamingMessages: newStreamingMessages,
                status: 'streaming' as const,
              }
            },
            false,
            'setStreamingMessage',
          ),

        completeStreamingMessage: (messageId, finalMessage) =>
          set(
            (state) => {
              const newStreamingMessages = new Map(state.streamingMessages)
              newStreamingMessages.delete(messageId)
              return {
                streamingMessages: newStreamingMessages,
                messages: [...state.messages, finalMessage],
                status: 'idle' as const,
              }
            },
            false,
            'completeStreamingMessage',
          ),

        removeStreamingMessage: (messageId) =>
          set(
            (state) => {
              const newStreamingMessages = new Map(state.streamingMessages)
              newStreamingMessages.delete(messageId)
              return {
                streamingMessages: newStreamingMessages,
              }
            },
            false,
            'removeStreamingMessage',
          ),

        setStatus: (status) =>
          set(
            {
              status,
            },
            false,
            'setStatus',
          ),

        setError: (error) =>
          set(
            {
              error,
              status: error ? 'error' : 'idle',
            },
            false,
            'setError',
          ),

        reset: () =>
          set(
            {
              ...initialState,
              streamingMessages: new Map(),
            },
            false,
            'reset',
          ),
      }),
      {
        name: 'chat-store',
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


