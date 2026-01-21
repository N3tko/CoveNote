'use client'

import type { ChatMessage } from '@netko/claw-domain'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { client } from '@/integrations/eden'

/**
 * Hook to send messages with TanStack Query optimistic updates
 * Real-time updates are handled by the subscription in useChatRealtime
 */
export function useSendMessage(chatId: string | null) {
  const queryClient = useQueryClient()

  const sendMessageMutation = useMutation({
    mutationFn: async ({
      content,
      assistantId,
      modelId,
    }: {
      content: string
      assistantId?: string
      modelId?: string
    }) => {
      if (!chatId) throw new Error('No active chat')

      const response = await client.api.chats[chatId].messages.post({
        content,
        assistantId,
        modelId,
      })

      if (response.error) {
        throw new Error(
          typeof response.error === 'object' && 'error' in response.error
            ? (response.error as { error: string }).error
            : 'Failed to send message',
        )
      }

      return response.data
    },
    onError: (error) => {
      toast.error('Failed to send message', {
        description: error instanceof Error ? error.message : 'Unknown error',
        position: 'top-right',
      })
    },
  })

  const sendMessage = useCallback(
    async (content: string, assistantId?: string, modelId?: string) => {
      if (!chatId) {
        toast.error('No active chat', {
          position: 'top-right',
        })
        return
      }

      const queryKey = ['messages', chatId]

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey })

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData<ChatMessage[]>(queryKey)

      // Create optimistic message
      const tempId = `temp-${Date.now()}`
      const optimisticMessage: ChatMessage = {
        id: tempId,
        eventId: tempId,
        chatId,
        content,
        role: 'user',
        assistantId: assistantId ?? null,
        modelId: modelId ?? null,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Optimistically update cache
      queryClient.setQueryData<ChatMessage[]>(queryKey, (old = []) => [...old, optimisticMessage])

      try {
        // Send to server (subscription will handle the real update)
        await sendMessageMutation.mutateAsync({
          content,
          assistantId,
          modelId,
        })

        // Remove optimistic message after successful send
        // Real message will come via subscription
        queryClient.setQueryData<ChatMessage[]>(queryKey, (old = []) =>
          old.filter((m) => m.id !== tempId),
        )
      } catch (error) {
        // Rollback on error
        if (previousMessages) {
          queryClient.setQueryData<ChatMessage[]>(queryKey, previousMessages)
        }
        console.error('Error sending message:', error)
      }
    },
    [chatId, sendMessageMutation, queryClient],
  )

  return {
    sendMessage,
    isLoading: sendMessageMutation.isPending,
  }
}
