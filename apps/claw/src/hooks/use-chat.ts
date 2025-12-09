import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSubscription } from '@trpc/tanstack-react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useTRPC } from '@/integrations/trpc/react'
import { useChatStore } from '@/stores'

/**
 * Hook for managing chat state with tRPC
 * Uses real-time subscriptions for streaming AI responses
 */
export function useChat(chatId: string | null) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [lastEventId, setLastEventId] = useState<string | null>(null)

  const {
    currentChat,
    messages,
    streamingMessages,
    status,
    error,
    setCurrentChat,
    setMessages,
    addMessage,
    setStreamingMessage,
    completeStreamingMessage,
    removeStreamingMessage,
    setStatus,
    setError,
  } = useChatStore()

  // Fetch chat details
  const {
    data: chat,
    isLoading: isChatLoading,
    error: chatError,
  } = useQuery({
    ...trpc.chats.getById.queryOptions({ chatId: chatId ?? '' }),
    enabled: !!chatId,
  })

  // Fetch messages
  const {
    data: fetchedMessages,
    isLoading: isMessagesLoading,
    error: messagesError,
  } = useQuery({
    ...trpc.messages.getByChatId.queryOptions({ chatId: chatId ?? '' }),
    enabled: !!chatId,
  })

  // Real-time subscription for chat messages
  useSubscription({
    ...trpc.messages.onChatMessage.subscriptionOptions({
      chatId: chatId ?? '',
    }),
    enabled: !!chatId,
    onData: (event) => {
      try {
        const data = event.data as {
          type: 'message_created' | 'message_streaming' | 'message_completed' | 'message_error'
          timestamp?: number
          messageId?: string
          content?: string
          message?: {
            id: string
            chatId: string
            role: string
            content: string
            createdAt: string
          }
          error?: string
        }

        switch (data.type) {
          case 'message_created': {
            if (data.message) {
              // If it's a temp message (streaming), add to streaming state
              if (data.messageId?.startsWith('temp-')) {
                setStreamingMessage(data.messageId, data.message.content)
                setStatus('streaming')
              } else {
                // Regular message - add to messages
                addMessage({
                  id: data.message.id,
                  chatId: data.message.chatId,
                  role: data.message.role as 'user' | 'assistant' | 'system',
                  content: data.message.content,
                  assistantId: null,
                  modelId: null,
                  metadata: null,
                  createdAt: new Date(data.message.createdAt),
                  updatedAt: new Date(data.message.createdAt),
                })
              }
            }
            break
          }

          case 'message_streaming': {
            if (data.messageId && data.content !== undefined) {
              setStreamingMessage(data.messageId, data.content)
              setStatus('streaming')
            }
            break
          }

          case 'message_completed': {
            if (data.messageId && data.message) {
              completeStreamingMessage(data.messageId, {
                id: data.message.id,
                chatId: data.message.chatId,
                role: data.message.role as 'user' | 'assistant' | 'system',
                content: data.message.content,
                assistantId: null,
                modelId: null,
                metadata: null,
                createdAt: new Date(data.message.createdAt),
                updatedAt: new Date(data.message.createdAt),
              })
              setStatus('idle')

              // Invalidate messages query to ensure consistency
              queryClient.invalidateQueries({
                queryKey: trpc.messages.getByChatId.queryOptions({ chatId: chatId ?? '' }).queryKey,
              })
            }
            break
          }

          case 'message_error': {
            if (data.error) {
              setError(data.error)
              toast.error('Generation failed', { description: data.error })
            }
            // Clean up any streaming state
            if (data.messageId) {
              removeStreamingMessage(data.messageId)
            }
            setStatus('error')
            break
          }
        }

        // Update last event ID for reconnection
        if (data.timestamp) {
          setLastEventId(String(data.timestamp))
        }
      } catch (err) {
        console.error('Error processing subscription event:', err)
      }
    },
    onError: (err) => {
      console.error('Subscription error:', err)
      toast.error('Connection lost - attempting to reconnect...')
    },
  })

  // Update store when chat data changes
  useEffect(() => {
    if (chat) {
      setCurrentChat(chat)
    }
  }, [chat, setCurrentChat])

  // Update store when messages change
  useEffect(() => {
    if (fetchedMessages) {
      setMessages(fetchedMessages)
    }
  }, [fetchedMessages, setMessages])

  // Update status based on loading states
  useEffect(() => {
    if (isChatLoading || isMessagesLoading) {
      setStatus('loading')
    } else if (chatError || messagesError) {
      setError(chatError?.message || messagesError?.message || 'An error occurred')
    } else if (status !== 'streaming') {
      setStatus('idle')
    }
  }, [isChatLoading, isMessagesLoading, chatError, messagesError, setStatus, setError, status])

  // Function to manually refetch messages
  const refetchMessages = () => {
    if (chatId) {
      queryClient.invalidateQueries({
        queryKey: trpc.messages.getByChatId.queryOptions({ chatId }).queryKey,
      })
    }
  }

  return {
    chat: currentChat,
    messages,
    streamingMessages,
    status,
    error,
    isLoading: isChatLoading || isMessagesLoading,
    refetchMessages,
    lastEventId,
  }
}
