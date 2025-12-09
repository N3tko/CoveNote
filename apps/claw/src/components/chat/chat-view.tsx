'use client'

import type { Chat, LLMAssistant, LLMModel } from '@netko/claw-domain'
import type { PromptInputMessage } from '@netko/ui/components/ai-elements/prompt-input'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { MessageSquarePlus, Sparkles } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useAssistants } from '@/hooks/use-assistants'
import { useChat } from '@/hooks/use-chat'
import { useModels } from '@/hooks/use-models'
import { useSendMessage } from '@/hooks/use-send-message'
import { useTRPC } from '@/integrations/trpc/react'
import { ChatAppBar } from './chat-app-bar'
import { ChatInput } from './chat-input'
import { ChatMessages } from './chat-messages'
import type { MessageType, ModelOption } from './definitions/message-types'

interface ChatViewProps {
  chatId?: string | null
  chat?: Chat | null
}

/**
 * Convert LLM Model to ModelOption format for the UI
 */
function convertToModelOption(model: LLMModel): ModelOption {
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
  const trpc = useTRPC()
  const isNewChat = !chatId

  // Hooks for data fetching and state management
  const {
    chat,
    messages,
    streamingMessages,
    status: chatStatus,
    isLoading,
  } = useChat(chatId ?? null)
  const { sendMessage, isLoading: isSending } = useSendMessage()
  const { assistants, currentAssistant, selectAssistant } = useAssistants()
  const { models, currentModel, selectModel } = useModels()

  // Local UI state
  const [text, setText] = useState('')
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false)
  const [useWebSearch, setUseWebSearch] = useState(false)
  const [useMicrophone, setUseMicrophone] = useState(false)

  // Mutation for creating a new chat
  const createChatMutation = useMutation({
    ...trpc.chats.create.mutationOptions(),
    onError: (error) => {
      toast.error('Failed to create chat', {
        description: error.message,
      })
    },
  })

  // Convert messages to the UI format
  const uiMessages = useMemo((): MessageType[] => {
    const messageList: MessageType[] = messages.map((msg) => ({
      key: msg.id,
      from: msg.role === 'user' ? 'user' : 'assistant',
      versions: [
        {
          id: msg.id,
          content: msg.content,
        },
      ],
    }))

    // Add streaming messages
    streamingMessages.forEach((streamMsg) => {
      messageList.push({
        key: streamMsg.id,
        from: 'assistant',
        versions: [
          {
            id: streamMsg.id,
            content: streamMsg.content,
          },
        ],
      })
    })

    return messageList
  }, [messages, streamingMessages])

  // Convert models to UI format
  const modelOptions = useMemo(() => models.map((model) => convertToModelOption(model)), [models])

  // Determine status for UI
  const uiStatus = useMemo((): 'submitted' | 'streaming' | 'ready' | 'error' => {
    if (chatStatus === 'streaming') return 'streaming'
    if (chatStatus === 'loading' || isSending) return 'submitted'
    if (chatStatus === 'error') return 'error'
    return 'ready'
  }, [chatStatus, isSending])

  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {
      const hasText = Boolean(message.text?.trim())
      const hasAttachments = Boolean(message.files?.length)

      if (!(hasText || hasAttachments)) {
        return
      }

      if (message.files?.length) {
        toast.info('File attachments coming soon!')
      }

      if (hasText && message.text) {
        // If this is a new chat, create it first
        if (isNewChat) {
          try {
            const newChat = await createChatMutation.mutateAsync({
              title: message.text.slice(0, 100), // Use first 100 chars as title
              selectedAssistant: currentAssistant?.id,
              selectedModel: currentModel?.id,
            })

            if (newChat) {
              // Navigate to the new chat
              await router.navigate({
                to: '/chat/$chatId',
                params: { chatId: newChat.id },
              })

              // Send the message after navigation
              // The message will be sent in the new chat context
              setTimeout(() => {
                void sendMessage(message.text, currentAssistant?.id, currentModel?.id)
              }, 100)
            }
          } catch (error) {
            console.error('Failed to create chat:', error)
            return
          }
        } else {
          // Existing chat - just send the message
          void sendMessage(message.text, currentAssistant?.id, currentModel?.id)
        }

        setText('') // Clear input after sending
      }
    },
    [isNewChat, sendMessage, currentAssistant, currentModel, createChatMutation, router],
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

  // Loading state
  if (isLoading && !isNewChat) {
    return (
      <div className="relative flex size-full flex-col items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    )
  }

  // Empty state for new chat
  const showEmptyState = isNewChat || (messages.length === 0 && streamingMessages.size === 0)

  return (
    <div className="relative flex size-full flex-col overflow-hidden">
      <ChatAppBar
        assistants={assistants}
        assistant={currentAssistant}
        chatTitle={isNewChat ? 'New Chat' : chat?.title || 'Untitled Chat'}
        onAssistantChange={handleAssistantChange}
        onSettingsClick={handleSettingsClick}
        onShareClick={handleShareClick}
        onArchiveClick={handleArchiveClick}
        onDeleteClick={handleDeleteClick}
      />

      {showEmptyState ? (
        <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto pb-40 pt-12">
          <div className="mx-auto w-full max-w-2xl space-y-8 px-4 text-center">
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
                      setText(prompts[index])
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
        </div>
      ) : (
        <ChatMessages messages={uiMessages} />
      )}

      <ChatInput
        model={currentModel?.id || ''}
        models={modelOptions}
        modelSelectorOpen={modelSelectorOpen}
        status={uiStatus}
        text={text}
        useMicrophone={useMicrophone}
        useWebSearch={useWebSearch}
        onModelChange={handleModelChange}
        onModelSelectorOpenChange={setModelSelectorOpen}
        onTextChange={setText}
        onUseMicrophoneChange={setUseMicrophone}
        onUseWebSearchChange={setUseWebSearch}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default ChatView
