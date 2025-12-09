import { useTRPC } from '@/integrations/trpc/react'
import { useChatStore } from '@/stores'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { toast } from 'sonner'

/**
 * Hook for sending messages
 */
export function useSendMessage() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { currentChat, setStatus, setError } = useChatStore()

  const createMessageMutation = useMutation({
    ...trpc.messages.create.mutationOptions(),
    onMutate: () => {
      setStatus('loading')
    },
    onSuccess: () => {
      // Refetch messages after sending
      if (currentChat) {
        queryClient.invalidateQueries({
          queryKey: trpc.messages.getByChatId.queryOptions({ chatId: currentChat.id }).queryKey,
        })
      }
      setStatus('idle')
    },
    onError: (error) => {
      setError(error.message)
      toast.error('Failed to send message', {
        description: error.message,
      })
    },
  })

  const sendMessage = useCallback(
    async (content: string, assistantId?: string, modelId?: string) => {
      if (!currentChat) {
        toast.error('No active chat')
        return
      }

      if (!content.trim()) {
        return
      }

      try {
        await createMessageMutation.mutateAsync({
          chatId: currentChat.id,
          role: 'user',
          content: content.trim(),
          assistantId: assistantId || currentChat.selectedAssistant || undefined,
          modelId: modelId || currentChat.selectedModel || undefined,
        })
      } catch (error) {
        console.error('Failed to send message:', error)
      }
    },
    [currentChat, createMessageMutation],
  )

  return {
    sendMessage,
    isLoading: createMessageMutation.isPending,
    error: createMessageMutation.error,
  }
}

