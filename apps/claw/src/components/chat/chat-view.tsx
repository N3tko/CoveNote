'use client'

import type { Chat, ChatMessage, LLMAssistant } from '@netko/claw-domain'
import { useChat } from '@ai-sdk/react'
import { TextStreamChatTransport } from 'ai'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { AlertCircle, MessageSquarePlus, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import { useAssistants } from '@/hooks/use-assistants'
import { useByokValidation } from '@/hooks/use-byok-validation'
import { useModels } from '@/hooks/use-models'
import { client } from '@/integrations/eden'
import { useChatStore } from '@/stores/chat-store'
import { ChatAppBar } from './chat-app-bar'
import { ChatInput } from './chat-input'
import { ChatMessages } from './chat-messages'
import type { MessageType, ModelOption, PromptInputMessage } from './definitions/message-types'

interface ChatViewProps {
  chatId?: string | null
  chat?: Chat | null
}

/**
 * Convert LLM Model to ModelOption format for the UI
 */
function convertToModelOption(model: { id: string; name: string; provider: string }): ModelOption {
  return {
    id: model.id,
    name: model.name,
    chef: model.provider.charAt(0).toUpperCase() + model.provider.slice(1),
    chefSlug: model.provider,
    providers: [model.provider],
  }
}

export const ChatView = ({ chatId }: ChatViewProps) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const isNewChat = !chatId

  const { currentChat } = useChatStore()
  const { assistants, currentAssistant, selectAssistant } = useAssistants()
  const { models, currentModel, selectModel } = useModels()
  const byokValidation = useByokValidation(currentModel)

  // Local UI state
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false)
  const [useWebSearch, setUseWebSearch] = useState(false)
  const [useMicrophone, setUseMicrophone] = useState(false)

  // Fetch existing messages for existing chats
  const { data: existingMessages } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      if (!chatId) return []
      const response = await client.api.chats[chatId].messages.get()
      if (response.error) throw new Error('Failed to fetch messages')
      return response.data
    },
    enabled: !!chatId,
  })

  // Create transport - body will be passed at request time via append() to avoid stale values
  const chatTransport = useMemo(() => {
    return new TextStreamChatTransport({
      api: '/api/chat',
    })
  }, [])

  // Use the AI SDK's useChat hook with text stream transport
  const {
    messages,
    input,
    setInput,
    handleSubmit: handleChatSubmit,
    isLoading,
    status,
    setMessages,
    append,
  } = useChat({
    transport: chatTransport,
    onError: (error) => {
      toast.error('Failed to send message', {
        description: error.message,
        position: 'top-right',
      })
    },
    onFinish: () => {
      // Invalidate chat list to update titles
      void queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
  })

  // Sync existing messages to useChat state when loading an existing chat
  useEffect(() => {
    if (existingMessages && existingMessages.length > 0 && messages.length === 0) {
      const convertedMessages = existingMessages.map((msg: ChatMessage) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      }))
      setMessages(convertedMessages)
    }
  }, [existingMessages, messages.length, setMessages])

  // Mutation for creating a new chat using Eden Treaty
  const createChatMutation = useMutation({
    mutationFn: async (data: {
      title: string
      selectedAssistant?: string
      selectedModel?: string
    }) => {
      const response = await client.api.chats.post(data)
      if (response.error) {
        throw new Error(
          typeof response.error === 'object' && 'error' in response.error
            ? (response.error as { error: string }).error
            : 'Failed to create chat',
        )
      }
      return response.data
    },
    onError: (error) => {
      toast.error('Failed to create chat', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    },
  })

  // Convert messages to the UI format
  const uiMessages = useMemo((): MessageType[] => {
    return messages.map((msg) => ({
      key: msg.id,
      from: msg.role === 'user' ? 'user' : 'assistant',
      content: typeof msg.content === 'string' ? msg.content : '',
    }))
  }, [messages])

  // Convert models to UI format
  const modelOptions = useMemo(() => models.map((model) => convertToModelOption(model)), [models])

  // Determine status for UI
  const uiStatus = useMemo((): 'submitted' | 'streaming' | 'ready' | 'error' => {
    if (status === 'streaming') return 'streaming'
    if (status === 'submitted' || isLoading) return 'submitted'
    return 'ready'
  }, [status, isLoading])

  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {
      const hasText = Boolean(message.text?.trim())
      const hasAttachments = Boolean(message.files?.length)

      console.log('[ChatView] handleSubmit called', {
        hasText,
        hasAttachments,
        currentModelId: currentModel?.id,
        currentAssistantId: currentAssistant?.id,
        chatId,
      })

      if (!(hasText || hasAttachments)) {
        return
      }

      // Validate BYOK before proceeding
      if (!byokValidation.isValid) {
        toast.error('API Key Required', {
          description: byokValidation.message,
          position: 'top-right',
          action: {
            label: 'Go to Settings',
            onClick: () => {
              router.navigate({ to: '/settings' })
            },
          },
        })
        return
      }

      // Validate model selection
      if (!currentModel) {
        console.error('[ChatView] No model selected', { models, currentModel })
        toast.error('Model Required', {
          description: `Please select a model before sending a message. Available models: ${models.length}`,
          position: 'top-right',
        })
        return
      }

      console.log('[ChatView] Sending message with model', {
        modelId: currentModel.id,
        modelName: currentModel.name,
      })

      if (message.files?.length) {
        toast.info('File attachments coming soon!')
      }

      if (hasText && message.text) {
        // If this is a new chat, create it first
        if (isNewChat) {
          try {
            const newChat = await createChatMutation.mutateAsync({
              title: 'New Conversation',
              selectedAssistant: currentAssistant?.id,
              selectedModel: currentModel?.id,
            })

            if (newChat && 'id' in newChat) {
              // Navigate to the new chat
              await router.navigate({
                to: '/chat/$chatId',
                params: { chatId: newChat.id },
              })

              // Append message using useChat's append (will be sent after navigation)
              // Pass body at request time to avoid stale values
              setTimeout(() => {
                append(
                  {
                    role: 'user',
                    content: message.text,
                  },
                  {
                    body: {
                      chatId: newChat.id,
                      assistantId: currentAssistant?.id,
                      modelId: currentModel?.id,
                    },
                  },
                )
              }, 100)
            }
          } catch (error) {
            console.error('Failed to create chat:', error)
            toast.error('Failed to create chat', {
              description: error instanceof Error ? error.message : 'Unknown error',
              position: 'top-right',
            })
            return
          }
        } else {
          // Existing chat - use useChat's append
          // Pass body at request time to avoid stale values
          append(
            {
              role: 'user',
              content: message.text,
            },
            {
              body: {
                chatId,
                assistantId: currentAssistant?.id,
                modelId: currentModel?.id,
              },
            },
          )
        }

        setInput('') // Clear input after sending
      }
    },
    [
      isNewChat,
      chatId,
      append,
      setInput,
      currentAssistant,
      currentModel,
      models,
      byokValidation,
      createChatMutation,
      router,
    ],
  )

  const handleAssistantChange = useCallback(
    (assistant: LLMAssistant) => {
      selectAssistant(assistant)
    },
    [selectAssistant],
  )

  const handleModelChange = useCallback(
    (modelId: string) => {
      const model = models.find((m) => m.id === modelId)
      if (model !== undefined) {
        selectModel(model)
      }
    },
    [models, selectModel],
  )

  const handleSettingsClick = useCallback(() => {
    toast.info('Settings clicked')
  }, [])

  const handleShareClick = useCallback(() => {
    toast.info('Share clicked')
  }, [])

  const handleArchiveClick = useCallback(() => {
    toast.info('Archive clicked')
  }, [])

  const handleDeleteClick = useCallback(() => {
    toast.error('Delete clicked')
  }, [])

  // Empty state for new chat
  const showEmptyState = isNewChat || messages.length === 0

  return (
    <div className="relative flex size-full flex-col overflow-hidden">
      <ChatAppBar
        assistants={assistants}
        assistant={currentAssistant}
        chatTitle={isNewChat ? 'New Chat' : currentChat?.title || 'Untitled Chat'}
        onAssistantChange={handleAssistantChange}
        onSettingsClick={handleSettingsClick}
        onShareClick={handleShareClick}
        onArchiveClick={handleArchiveClick}
        onDeleteClick={handleDeleteClick}
      />

      {/* API Key Warning Banner */}
      {!byokValidation.isValid && (
        <div className="mt-10 border-b border-orange-500/20 bg-orange-500/10 px-4 py-3">
          <div className="mx-auto flex max-w-3xl items-center gap-3 text-sm text-orange-600 dark:text-orange-400">
            <AlertCircle className="size-4 flex-shrink-0" />
            <p className="flex-1">
              {byokValidation.message}. Configure your API key to start chatting.
            </p>
            <button
              type="button"
              onClick={() => router.navigate({ to: '/settings' })}
              className="flex-shrink-0 rounded-md bg-orange-600 px-3 py-1 text-xs font-medium text-white hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
            >
              Go to Settings
            </button>
          </div>
        </div>
      )}

      {showEmptyState ? (
        <Conversation className="pb-40 pt-12">
          <ConversationContent className="items-center justify-center">
            <ConversationEmptyState
              className="mx-auto max-w-2xl"
              title=""
              description=""
            >
              <div className="space-y-8 text-center">
                <div className="space-y-4">
                  <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/10">
                    <MessageSquarePlus className="size-10 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Start a New Conversation</h1>
                    <p className="text-lg text-muted-foreground">
                      Ask me anything, and I'll do my best to help you.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-medium text-muted-foreground">Try asking about:</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        icon: Sparkles,
                        title: 'Code assistance',
                        description: 'Get help with programming tasks',
                      },
                      {
                        icon: MessageSquarePlus,
                        title: 'General questions',
                        description: 'Ask about any topic',
                      },
                      {
                        icon: Sparkles,
                        title: 'Creative writing',
                        description: 'Generate ideas and content',
                      },
                      {
                        icon: MessageSquarePlus,
                        title: 'Problem solving',
                        description: 'Work through challenges together',
                      },
                    ].map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          const prompts = [
                            'Help me write a function to sort an array',
                            'What is quantum computing?',
                            'Write a short story about a robot',
                            'How can I improve my productivity?',
                          ]
                          setInput(prompts[index])
                        }}
                        className="group relative rounded-lg border border-border/50 bg-background/50 p-4 text-left transition-all hover:border-primary/50 hover:bg-background hover:shadow-md"
                      >
                        <div className="flex items-start gap-3">
                          <div className="rounded-md bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
                            <suggestion.icon className="size-4 text-primary" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="font-medium">{suggestion.title}</p>
                            <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </ConversationEmptyState>
          </ConversationContent>
        </Conversation>
      ) : (
        <Conversation className="pb-40 pt-12">
          <ConversationContent className="mx-auto w-full max-w-3xl px-4">
            <ChatMessages messages={uiMessages} isStreaming={status === 'streaming'} />
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      )}

      <ChatInput
        model={currentModel?.id || ''}
        models={modelOptions}
        modelSelectorOpen={modelSelectorOpen}
        status={uiStatus}
        text={input}
        useMicrophone={useMicrophone}
        useWebSearch={useWebSearch}
        disabled={!byokValidation.isValid}
        placeholder={
          byokValidation.isValid
            ? 'Type a message...'
            : 'Configure your API key in settings to start chatting'
        }
        onModelChange={handleModelChange}
        onModelSelectorOpenChange={setModelSelectorOpen}
        onTextChange={setInput}
        onUseMicrophoneChange={setUseMicrophone}
        onUseWebSearchChange={setUseWebSearch}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default ChatView
