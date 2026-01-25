import type { AuthenticatedContext, ChatMessage, LLMModel } from '@netko/claw-domain'
import { createLogger } from '@netko/logger'
import { RedisClient } from 'bun'
import {
  generateTitle,
  getMessagesToSummarize,
  shouldSummarize,
  streamChatCompletion,
  summarizeMessages,
} from './index'

const logger = createLogger('stream-processor')

export interface StreamProcessorOptions {
  chatId: string
  userMessageId: string
  assistantId?: string
  modelId: string
  apiKey: string
  systemPrompt?: string
  ctx: AuthenticatedContext
}

/**
 * Process LLM streaming and publish events to Redis
 * This runs in the background and publishes to chat:${chatId} channel
 */
export async function processLLMStream(
  options: StreamProcessorOptions,
  messages: ChatMessage[],
  model: LLMModel,
): Promise<void> {
  const { chatId, assistantId, modelId, apiKey, systemPrompt } = options

  // Use environment variable directly to avoid exposing config to client
  const redisUrl = process.env.CACHE_URL
  if (!redisUrl || redisUrl.trim() === '') {
    throw new Error('CACHE_URL environment variable is not set or is empty')
  }

  // Validate URL format
  try {
    new URL(redisUrl)
  } catch (_error) {
    throw new Error(
      `Invalid Redis URL format: ${redisUrl}. Expected format: redis://host:port or redis://username:password@host:port`,
    )
  }

  // Bun RedisClient constructor: new RedisClient(url?: string, options?: RedisOptions)
  const publisher = new RedisClient(redisUrl)

  await publisher.connect()
  const channel = `chat:${chatId}`

  try {
    // Set status to generating
    await publisher.set(`chat:${chatId}:status`, 'generating')
    // Set expire to 1 hour to avoid stale keys
    await publisher.expire(`chat:${chatId}:status`, 3600)

    // Check if summarization is needed
    if (shouldSummarize(messages)) {
      logger.info({ chatId }, 'Summarizing messages before generating response')
      const { toSummarize, toKeep } = getMessagesToSummarize(messages)

      if (toSummarize.length > 0) {
        const summary = await summarizeMessages({
          messages: toSummarize,
          apiKey,
        })

        // Save system message with summary (import dynamically to avoid circular deps)
        const { saveSystemMessage } = await import('../mutations/message/save-system-message')
        await saveSystemMessage({
          chatId,
          content: `Previous conversation summary: ${summary}`,
          metadata: { type: 'summary', originalMessageCount: toSummarize.length },
        })

        // Publish summarization event
        await publisher.publish(
          channel,
          JSON.stringify({
            id: `${Date.now()}-summarized`,
            type: 'summarized',
            summary,
          }),
        )

        // Update messages to use for AI generation
        messages = [
          {
            id: 'summary',
            role: 'system',
            content: `Previous conversation summary: ${summary}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            chatId: chatId,
            assistantId: null,
            modelId: null,
            eventId: `${Date.now()}-summarized`,
            metadata: { type: 'summary', originalMessageCount: toSummarize.length },
          },
          ...toKeep,
        ]
      }
    }

    // Prepare messages for AI
    const aiMessages = messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    }))

    // Generate temporary ID for streaming
    const tempId = `temp-${Date.now()}`
    let fullContent = ''

    // Stream tokens
    const stream = streamChatCompletion({
      messages: aiMessages,
      model,
      apiKey,
      systemPrompt,
    })

    for await (const token of stream) {
      fullContent += token

      // Publish token event
      await publisher.publish(
        channel,
        JSON.stringify({
          id: `${Date.now()}-token`,
          type: 'ai_token',
          content: token,
          tempId,
        }),
      )
    }

    // Save assistant message to DB
    const { saveAssistantMessage } = await import('../mutations/message/save-assistant-message')
    const assistantMessage = await saveAssistantMessage({
      chatId,
      content: fullContent,
      assistantId,
      modelId,
    })

    // Publish completion event
    await publisher.publish(
      channel,
      JSON.stringify({
        id: assistantMessage?.eventId ?? `${Date.now()}-complete`,
        type: 'ai_complete',
        messageId: assistantMessage?.id ?? tempId,
        tempId,
        message: assistantMessage ?? null,
      }),
    )

    // Set status to complete
    await publisher.set(`chat:${chatId}:status`, 'complete')
    await publisher.expire(`chat:${chatId}:status`, 3600)

    // Generate title if this is the first exchange
    if (messages.filter((m) => m.role === 'user').length === 1) {
      logger.info({ chatId }, 'Generating title for new chat')
      const firstUserMessage = messages.find((m) => m.role === 'user')

      if (firstUserMessage) {
        const title = await generateTitle({
          firstMessage: firstUserMessage.content,
          apiKey,
        })

        // Update chat title
        const { updateChat } = await import('../mutations/chat/update-chat')
        await updateChat(chatId, { title }, options.ctx)

        // Publish title event
        await publisher.publish(
          channel,
          JSON.stringify({
            id: `${Date.now()}-title`,
            type: 'title_generated',
            title,
          }),
        )
      }
    }
  } catch (error) {
    logger.error({ error, chatId }, 'Error processing LLM stream')

    // Publish error event
    await publisher.publish(
      channel,
      JSON.stringify({
        id: `${Date.now()}-error`,
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    )

    // Set status to error
    await publisher.set(`chat:${chatId}:status`, 'error')
    await publisher.expire(`chat:${chatId}:status`, 3600)
  } finally {
    // Cleanup
    publisher.close()
    logger.debug({ chatId }, 'Stream processor completed')
  }
}
