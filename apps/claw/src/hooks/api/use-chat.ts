import { useQuery } from '@tanstack/react-query'
import { eden } from '@/lib/eden'

/**
 * Chat API Hooks
 *
 * Hooks for fetching chat data from the Elysia backend.
 * Your chats are safe with us. Probably. 🐱
 */

// Query keys for cache management
export const chatKeys = {
  all: ['chats'] as const,
  sidebar: () => [...chatKeys.all, 'sidebar'] as const,
  search: (query: string) => [...chatKeys.all, 'search', query] as const,
  detail: (chatId: string) => [...chatKeys.all, 'detail', chatId] as const,
  messages: (chatId: string) => [...chatKeys.all, 'messages', chatId] as const,
}

/**
 * Fetch sidebar chats for navigation
 */
export function useSidebarChats() {
  return useQuery({
    queryKey: chatKeys.sidebar(),
    queryFn: async () => {
      const { data, error } = await eden.api.v1.chat.sidebar.get()
      if (error) throw error
      return data ?? []
    },
  })
}

/**
 * Search chats by query string
 */
export function useSearchChats(query: string) {
  return useQuery({
    queryKey: chatKeys.search(query),
    queryFn: async () => {
      const { data, error } = await eden.api.v1.chat.search.get({ query: { query } })
      if (error) throw error
      return data ?? []
    },
    enabled: query.length > 0,
  })
}

/**
 * Fetch a specific chat by ID
 */
export function useChat(chatId: string | undefined) {
  return useQuery({
    queryKey: chatKeys.detail(chatId ?? ''),
    queryFn: async () => {
      if (!chatId) return null
      const { data, error } = await eden.api.v1.chat({ chatId }).get()
      if (error) throw error
      return data
    },
    enabled: !!chatId,
  })
}

/**
 * Fetch messages for a specific chat
 */
export function useChatMessages(chatId: string | undefined) {
  return useQuery({
    queryKey: chatKeys.messages(chatId ?? ''),
    queryFn: async () => {
      if (!chatId) return []
      const { data, error } = await eden.api.v1.chat({ chatId }).messages.get()
      if (error) throw error
      return data ?? []
    },
    enabled: !!chatId,
  })
}

