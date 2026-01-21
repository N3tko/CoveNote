'use client'

import type { ChatMessage } from '@netko/claw-domain'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { client } from '@/integrations/eden'
import { useChatStore } from '@/stores/chat-store'

/**
 * Unified real-time chat hook using TanStack Query for message management
 * Handles SSE subscription, optimistic updates, and streaming state
 */
export function useChatRealtime(chatId: string | null) {
  const queryClient = useQueryClient()
  const eventSourceRef = useRef<EventSource | null>(null)

  const streamingState = useChatStore((state) => state.streamingState)

  // Query for messages using Eden Treaty
  const messagesQuery = useQuery({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      if (!chatId) return []
      const response = await client.api.chats[chatId].messages.get()
      if (response.error) throw new Error('Failed to fetch messages')
      return response.data
    },
    enabled: !!chatId,
    staleTime: 0, // Always consider stale so subscription updates work
  })

  // Subscribe to real-time updates via SSE
  useEffect(() => {
    if (!chatId) {
      eventSourceRef.current?.close()
      eventSourceRef.current = null
      return
    }

    // Create SSE connection
    const eventSource = new EventSource(`/api/chats/${chatId}/messages/stream`)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      console.log('SSE connected to chat:', chatId)
    }

    eventSource.onerror = (error) => {
      console.error('SSE error:', error)
      toast.error('Connection error. Reconnecting...', {
        position: 'top-right',
      })
    }

    // Handle different event types
    eventSource.addEventListener('connected', (event) => {
      console.log('Connected event:', event.data)
    })

    eventSource.addEventListener('message_created', (event) => {
      try {
        const data = JSON.parse(event.data)
        const message = data.message as ChatMessage

        queryClient.setQueryData<ChatMessage[]>(['messages', chatId], (oldMessages = []) => {
          const exists = oldMessages.some(
            (m) => m.id === message.id || m.eventId === message.eventId,
          )
          if (exists) return oldMessages
          return [...oldMessages, message]
        })
      } catch (err) {
        console.error('Error parsing message_created event:', err)
      }
    })

    eventSource.addEventListener('ai_token', (event) => {
      try {
        const data = JSON.parse(event.data) as { content: string; tempId: string }
        const { content, tempId } = data
        const currentState = useChatStore.getState().streamingState
        const currentContent =
          currentState?.tempId === tempId && currentState?.chatId === chatId
            ? currentState.content
            : ''
        useChatStore.getState().updateStreamingContent(chatId, tempId, currentContent + content)
      } catch (err) {
        console.error('Error parsing ai_token event:', err)
      }
    })

    eventSource.addEventListener('ai_complete', (event) => {
      try {
        const data = JSON.parse(event.data) as {
          messageId: string
          tempId: string
          message: ChatMessage
        }
        const { message } = data

        // Clear streaming state
        useChatStore.getState().finalizeStreaming()

        // Add final message to cache
        queryClient.setQueryData<ChatMessage[]>(['messages', chatId], (oldMessages = []) => {
          const exists = oldMessages.some((m) => m.id === message.id)
          if (exists) return oldMessages
          return [...oldMessages, message]
        })
      } catch (err) {
        console.error('Error parsing ai_complete event:', err)
      }
    })

    eventSource.addEventListener('title_generated', () => {
      // Refetch chat list to get updated title
      void queryClient.invalidateQueries({ queryKey: ['chats'] })
    })

    eventSource.addEventListener('summarized', () => {
      toast.info('Previous messages summarized to save context')
      void messagesQuery.refetch()
    })

    eventSource.addEventListener('error', (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data) as { error: string }
        toast.error(data.error, {
          position: 'top-right',
        })
      } catch {
        // Ignore parsing errors for generic error events
      }
    })

    return () => {
      eventSource.close()
      eventSourceRef.current = null
    }
  }, [chatId, queryClient, messagesQuery])

  return {
    messages: messagesQuery.data ?? [],
    isLoading: messagesQuery.isLoading,
    isStreaming: streamingState?.chatId === chatId,
    streamingContent: streamingState?.chatId === chatId ? streamingState.content : null,
  }
}
