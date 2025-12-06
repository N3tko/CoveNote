import type { LLMAssistant as Assistant, LLMModel } from '@netko/claw-domain'
import { ChatInput } from '@netko/ui/components/chat/chat-input'
import { MessagesList } from '@netko/ui/components/chat/messages-list'
import type { UIMessage } from '@netko/ui/components/chat/messages-list/definitions/types'
import { NewChatView } from '@netko/ui/components/chat/new-chat-view'
import { AnimatedBackground } from '@netko/ui/components/core/animated-background'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useLocation } from 'wouter'
import { BarsSpinner } from '@/components/core/spinner/bars-spinner'
import { useActiveModels, useAssistants, chatKeys } from '@/hooks/api'
import { useWebSocket } from '@/hooks/use-websocket'
import { authClient } from '@/lib/auth'
import { eden } from '@/lib/eden'
import { useChatStore, useCurrentLLMModel, useWebSearchEnabled } from '@/stores/chat'
import type { ChatViewProps } from './definitions/types'

/**
 * Chat View Component
 *
 * The main chat interface where users converse with AI assistants.
 * Where the magic happens. And occasionally the chaos. 💬🐱
 */

export function ChatView({ threadId, thread }: ChatViewProps) {
  const { data } = authClient.useSession()
  const user = data?.user
  const [, navigate] = useLocation()
  const queryClient = useQueryClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // State management
  const [chatInputValue, setChatInputValue] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null)
  const [lastEventId, setLastEventId] = useState<string | null>(null)

  // Persisted store-backed selections
  const currentLLMModel = useCurrentLLMModel()
  const selectedModelId = currentLLMModel?.id || ''
  const isWebSearchEnabled = useWebSearchEnabled()
  const setCurrentLLMModel = useChatStore((s) => s.setCurrentLLMModel)
  const setWebSearchEnabled = useChatStore((s) => s.setWebSearchEnabled)

  // Message state for real-time updates
  const [realtimeMessages, setRealtimeMessages] = useState<UIMessage[]>([])
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)

  // WebSocket for real-time updates
  useWebSocket({
    threadId,
    lastEventId,
    enabled: !!threadId,
    onMessageCreated: (message) => {
      setRealtimeMessages((prev) => {
        const exists = prev.find((m) => m.id === message.id)
        if (exists) return prev
        return [...prev, message]
      })
      if (message.role === 'ASSISTANT') {
        setStreamingMessageId(message.id)
        setIsGenerating(true)
      }
    },
    onMessageStreaming: (messageId, content) => {
      setRealtimeMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, content } : msg)),
      )
    },
    onMessageCompleted: (message) => {
      setRealtimeMessages((prev) =>
        prev.map((msg) => (msg.id === message.id ? message : msg)),
      )
      setStreamingMessageId(null)
      setIsGenerating(false)
    },
    onMessageError: () => {
      setStreamingMessageId(null)
      setIsGenerating(false)
      toast.error('Generation failed. Please try again.')
    },
  })

  // Fetch models and assistants using Eden hooks
  const { data: llmModels = [] } = useActiveModels()
  const { data: assistants = [] } = useAssistants()

  // Initialize realtime messages from thread messages
  useEffect(() => {
    const messagesToProcess = thread?.messages || []

    if (Array.isArray(messagesToProcess) && messagesToProcess.length > 0) {
      const initialMessages: UIMessage[] = messagesToProcess.map((msg) => ({
        ...msg,
        createdAt: new Date(msg.createdAt as unknown as string),
        isGenerating: false,
      }))
      setRealtimeMessages(initialMessages)
    }
  }, [thread?.messages])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (realtimeMessages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [realtimeMessages.length])

  // Initialize selected model from store or default to first available
  useEffect(() => {
    if (llmModels.length === 0) return
    const storeModelId = currentLLMModel?.id
    const storeModelExists = storeModelId ? llmModels.some((m) => m.id === storeModelId) : false

    if (!storeModelExists) {
      const firstModel = llmModels[0]
      if (firstModel) setCurrentLLMModel(firstModel)
    }
  }, [llmModels, currentLLMModel, setCurrentLLMModel])

  useEffect(() => {
    if (assistants.length > 0 && !selectedAssistant) {
      const threadAssistant = thread?.assistant
      const defaultAssistant =
        threadAssistant || assistants.find((a) => a.isPublic) || assistants[0]
      setSelectedAssistant(defaultAssistant || null)
    }
  }, [assistants, selectedAssistant, thread?.assistant])

  // Handle message submission
  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || isGenerating) return

      // Resolve assistant fallback
      const resolvedAssistant: Assistant | null =
        selectedAssistant ||
        thread?.assistant ||
        assistants.find((a) => a.isPublic) ||
        assistants[0] ||
        null

      if (!selectedAssistant && resolvedAssistant) {
        setSelectedAssistant(resolvedAssistant)
      }

      // Resolve model fallback
      const resolvedModel =
        (selectedModelId && llmModels.find((m) => m.id === selectedModelId)) || llmModels[0]

      if (!resolvedAssistant || !resolvedModel) {
        toast.error('Missing assistant or model selection. Please pick both and try again.')
        return
      }

      if (!currentLLMModel || currentLLMModel.id !== resolvedModel.id) {
        setCurrentLLMModel(resolvedModel)
      }

      setChatInputValue('')
      setIsGenerating(true)

      try {
        if (!threadId) {
          // Create new thread - Note: This endpoint needs to be added to the API
          // For now, we'll show a toast as the endpoint doesn't exist yet
          toast.info('Creating new chat... (API endpoint pending)')
          setIsGenerating(false)
        } else {
          // Send message to existing thread - Note: This endpoint needs to be added
          toast.info('Sending message... (API endpoint pending)')
          setIsGenerating(false)
        }
        
        // Invalidate sidebar cache
        queryClient.invalidateQueries({ queryKey: chatKeys.sidebar() })
      } catch (error) {
        toast.error('Failed to send message 😿')
        setIsGenerating(false)
      }
    },
    [
      threadId,
      isGenerating,
      selectedAssistant,
      selectedModelId,
      currentLLMModel,
      assistants,
      llmModels,
      setCurrentLLMModel,
      thread?.assistant,
      queryClient,
    ],
  )

  // Handle LLM model change
  const handleLLMModelChange = useCallback(
    (model: LLMModel) => {
      setCurrentLLMModel(model)
    },
    [setCurrentLLMModel],
  )

  // Handle file attachments (placeholder)
  const handleFilesSelected = useCallback((files: FileList) => {
    toast.info(`Selected ${files.length} file(s) - attachments coming soon! 📎`)
  }, [])

  // Handle web search toggle
  const handleWebSearchToggle = useCallback(
    (enabled: boolean) => {
      setWebSearchEnabled(enabled)
    },
    [setWebSearchEnabled],
  )

  // Handle suggestion clicks for new chat
  const handleSuggestionClick = useCallback((message: { role: 'user'; content: string }) => {
    setChatInputValue(message.content)
  }, [])

  // Update messages with generation state
  const displayMessages = realtimeMessages.map((msg) => ({
    ...msg,
    isGenerating: isGenerating && msg.id === streamingMessageId,
  }))

  // Loading states
  if (llmModels.length === 0 || assistants.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <BarsSpinner size={48} />
      </div>
    )
  }

  // Show new chat view if no thread is selected
  if (!threadId) {
    return (
      <div className="relative flex flex-col w-full h-full min-h-0">
        <AnimatedBackground />
        <div className="relative flex flex-col w-full h-full min-h-0 mx-auto max-w-4xl p-4 pb-32">
          <NewChatView
            userName={user?.name || 'there'}
            suggestions={[
              "Explain quantum computing like I'm 5 years old 🧠",
              'Write a Python script to analyze CSV data',
              'Help me brainstorm ideas for a weekend project',
              'Create a workout plan for someone who works from home',
            ]}
            append={handleSuggestionClick}
          />
        </div>
        <div className="pointer-events-none absolute left-0 right-0 bottom-0 flex justify-center w-full z-20 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <div className="pointer-events-auto w-full max-w-4xl mx-auto">
            <ChatInput
              value={chatInputValue}
              onChange={(e) => setChatInputValue(e.target.value)}
              onSend={() => handleSendMessage(chatInputValue)}
              isGenerating={isGenerating}
              llmModels={llmModels}
              selectedModel={selectedModelId}
              handleLLMModelChange={handleLLMModelChange}
              isWebSearchEnabled={isWebSearchEnabled}
              onWebSearchToggle={handleWebSearchToggle}
              onFilesSelected={handleFilesSelected}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="relative flex flex-col w-full h-full min-h-0 p-4 pb-32">
        <MessagesList messages={displayMessages} userAvatar={user?.image || ''} />
        <div ref={messagesEndRef} />
      </div>
      <div className="pointer-events-none absolute left-0 right-0 bottom-0 flex justify-center w-full z-20 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <div className="pointer-events-auto w-full max-w-4xl mx-auto">
          <ChatInput
            value={chatInputValue}
            onChange={(e) => setChatInputValue(e.target.value)}
            onSend={() => handleSendMessage(chatInputValue)}
            isGenerating={isGenerating}
            llmModels={llmModels}
            selectedModel={selectedModelId}
            handleLLMModelChange={handleLLMModelChange}
            isWebSearchEnabled={isWebSearchEnabled}
            onWebSearchToggle={handleWebSearchToggle}
            onFilesSelected={handleFilesSelected}
          />
        </div>
      </div>
    </>
  )
}
