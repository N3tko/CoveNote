import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { streamText } from 'ai'
import { createLogger } from '@netko/logger'
import type { LLMAssistant, LLMByok, LLMModel, ChatMessage } from '@netko/claw-domain'

const logger = createLogger('ai')

export interface GenerateResponseInput {
  chatId: string
  userId: string
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  model: LLMModel
  assistant: LLMAssistant
  apiKey: LLMByok
  onMessageCreated: (messageId: string) => void
  onStreaming: (messageId: string, content: string) => void
  onCompleted: (message: ChatMessage) => void
  onError: (error: string) => void
}

/**
 * Generate an AI response using OpenRouter
 * Streams the response and emits events for real-time updates
 */
export async function generateResponse(input: GenerateResponseInput): Promise<void> {
  const {
    chatId,
    userId,
    messages,
    model,
    assistant,
    apiKey,
    onMessageCreated,
    onStreaming,
    onCompleted,
    onError,
  } = input

  logger.info(
    {
      chatId,
      userId,
      model: model.slug,
      assistant: assistant.name,
      messageCount: messages.length,
    },
    'starting AI generation',
  )

  try {
    // Decrypt the API key
    const decryptedKey = apiKey.decryptedKey
    if (!decryptedKey) {
      throw new Error('API key not available')
    }

    // Create OpenRouter client
    const openrouter = createOpenRouter({
      apiKey: decryptedKey,
    })

    // Build messages with system prompt
    const fullMessages = [
      { role: 'system' as const, content: assistant.systemPrompt },
      ...messages,
    ]

    logger.debug(
      {
        chatId,
        model: model.slug,
        systemPromptLength: assistant.systemPrompt.length,
      },
      'calling OpenRouter',
    )

    // Generate a temporary message ID for streaming
    const tempMessageId = `temp-${Date.now()}`
    onMessageCreated(tempMessageId)

    // Stream the response
    const result = streamText({
      model: openrouter(model.slug),
      messages: fullMessages,
    })

    let fullContent = ''

    // Process the stream
    for await (const chunk of result.textStream) {
      fullContent += chunk
      onStreaming(tempMessageId, fullContent)
    }

    logger.info(
      {
        chatId,
        model: model.slug,
        responseLength: fullContent.length,
      },
      'AI generation completed',
    )

    // Return the completed message (caller should save to DB)
    onCompleted({
      id: tempMessageId,
      chatId,
      role: 'assistant',
      content: fullContent,
      assistantId: assistant.id,
      modelId: model.id,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error(
      {
        chatId,
        userId,
        model: model.slug,
        err: errorMessage,
      },
      'AI generation failed',
    )
    onError(errorMessage)
  }
}

