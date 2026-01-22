import type { ChatMessage } from '@netko/claw-domain'
import {
  generateTitle,
  getAssistantById,
  getChat,
  getLLMModelById,
  getMessagesByChatId,
  getUserByokByProvider,
  saveAssistantMessage,
  sendMessage,
  updateChat,
} from '@netko/claw-service'
import { createLogger } from '@netko/logger'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { streamText } from 'ai'
import { Elysia, t } from 'elysia'
import { authMacro } from '../context'

const logger = createLogger('chat-stream-api')

/**
 * Chat streaming route compatible with AI SDK's useChat hook
 * POST /api/chat - streams AI responses directly
 */
export const chatStreamRoutes = new Elysia({ prefix: '/chat' }).use(authMacro).post(
  '/',
  async ({ body, user, session, set }) => {
    logger.info(
      {
        body: JSON.stringify(body),
        userId: user?.id,
        hasMessages: body.messages?.length > 0,
        chatId: body.chatId,
        modelId: body.modelId,
        assistantId: body.assistantId,
      },
      'Chat stream request received',
    )

    try {
      const { messages, chatId, assistantId, modelId } = body
      const ctx = { user, session }

      logger.debug(
        { chatId, assistantId, modelId, messageCount: messages.length },
        'Parsed request body',
      )

      // If chatId is provided, verify ownership
      if (chatId) {
        logger.debug({ chatId }, 'Verifying chat ownership')
        const chat = await getChat(chatId, ctx)
        if (!chat) {
          logger.warn({ chatId, userId: user.id }, 'Chat not found')
          set.status = 404
          return { error: 'Chat not found' }
        }
        logger.debug({ chatId }, 'Chat ownership verified')
      }

      // Get model for provider lookup
      logger.info({ modelId, hasModelId: !!modelId }, 'Fetching model')
      if (!modelId) {
        logger.warn('No modelId provided in request')
        set.status = 400
        return { error: 'Model not found - no modelId provided' }
      }
      const model = await getLLMModelById(modelId)
      if (!model) {
        logger.warn({ modelId }, 'Model not found in database')
        set.status = 400
        return { error: `Model not found: ${modelId}` }
      }
      logger.debug({ modelId, modelSlug: model.slug, provider: model.provider }, 'Model found')

      // Get BYOK for the model's provider
      logger.debug({ userId: user.id, provider: model.provider }, 'Fetching BYOK')
      const byok = await getUserByokByProvider(user.id, model.provider)
      if (!byok?.decryptedKey) {
        logger.warn({ userId: user.id, provider: model.provider }, 'No API key configured')
        set.status = 400
        return { error: `No API key configured for ${model.provider}` }
      }
      logger.debug({ provider: model.provider }, 'BYOK found')

      // Get assistant if specified
      let assistant = null
      if (assistantId) {
        logger.debug({ assistantId }, 'Fetching assistant')
        assistant = await getAssistantById(assistantId)
        logger.debug(
          { assistantId, hasSystemPrompt: !!assistant?.systemPrompt },
          'Assistant fetched',
        )
      }

      // Convert incoming messages to the format expected by streamText
      // Handle both old format (content) and new AI SDK format (text or parts)
      logger.debug({ messageCount: messages.length }, 'Converting messages')
      const incomingMessages = messages
        .filter((msg) => {
          // Filter out messages without content
          const content = msg.content || (msg as unknown as { text?: string }).text
          return content !== undefined && content !== ''
        })
        .map((msg) => {
          // Support both 'content' (old format) and 'text' (new AI SDK format)
          const content = msg.content || (msg as unknown as { text?: string }).text || ''
          return {
            role: msg.role as 'user' | 'assistant' | 'system',
            content,
          }
        })

      // Add system prompt if assistant has one
      const allMessages = assistant?.systemPrompt
        ? [{ role: 'system' as const, content: assistant.systemPrompt }, ...incomingMessages]
        : incomingMessages

      logger.debug(
        { totalMessages: allMessages.length, hasSystemPrompt: !!assistant?.systemPrompt },
        'Messages prepared',
      )

      // Create OpenRouter client
      logger.debug({ provider: model.provider }, 'Creating OpenRouter client')
      const openrouter = createOpenRouter({
        apiKey: byok.decryptedKey,
      })

      // Get the last user message for saving
      const lastUserMessage = messages.filter((m) => m.role === 'user').pop()
      const lastUserMessageContent = lastUserMessage
        ? lastUserMessage.content || (lastUserMessage as unknown as { text?: string }).text || ''
        : ''
      logger.debug({ hasLastUserMessage: !!lastUserMessage, content: lastUserMessageContent }, 'Last user message identified')

      // Save user message before streaming (for immediate persistence)
      if (chatId && lastUserMessage && lastUserMessageContent) {
        try {
          logger.debug({ chatId }, 'Saving user message')
          await sendMessage(
            {
              chatId,
              content: lastUserMessageContent,
              assistantId: assistantId ?? null,
              modelId: modelId ?? null,
            },
            ctx,
          )
          logger.debug({ chatId }, 'User message saved')
        } catch (err) {
          logger.error({ error: err, chatId }, 'Error saving user message')
        }
      }

      // Stream the response using Elysia's SSE
      logger.info({ modelSlug: model.slug, messageCount: allMessages.length }, 'Starting stream')

      const result = streamText({
        model: openrouter(model.slug),
        messages: allMessages,
        async onFinish({ text }) {
          logger.debug({ chatId, textLength: text.length }, 'Stream finished')

          // Save assistant message to DB after streaming completes
          if (chatId) {
            try {
              logger.debug({ chatId }, 'Saving assistant message')
              await saveAssistantMessage({
                chatId,
                content: text,
                assistantId: assistantId ?? null,
                modelId: modelId ?? null,
              })
              logger.debug({ chatId }, 'Assistant message saved')

              // Generate title for new chats (first user message)
              const existingMessages = await getMessagesByChatId(chatId, ctx)
              const userMessages = existingMessages.filter((m: ChatMessage) => m.role === 'user')

              if (userMessages.length <= 1 && lastUserMessageContent) {
                logger.debug({ chatId }, 'Generating title for new chat')
                const title = await generateTitle({
                  firstMessage: lastUserMessageContent,
                  apiKey: byok.decryptedKey!,
                })

                await updateChat(chatId, { title }, ctx)
                logger.debug({ chatId, title }, 'Chat title updated')
              }
            } catch (err) {
              logger.error({ error: err, chatId }, 'Error saving assistant message after stream')
            }
          }
        },
      })

      logger.info('Returning UI message stream response')
      // Return the UI message stream response directly - compatible with useChat
      return result.toUIMessageStreamResponse()
    } catch (err) {
      logger.error({ error: err, stack: (err as Error).stack }, 'Unhandled error in chat stream')
      set.status = 500
      return { error: 'Internal server error', details: (err as Error).message }
    }
  },
  {
    auth: true,
    body: t.Object({
      messages: t.Array(
        t.Object({
          id: t.Optional(t.String()),
          role: t.Union([t.Literal('user'), t.Literal('assistant'), t.Literal('system')]),
          content: t.Optional(t.String()),
          text: t.Optional(t.String()),
        }),
      ),
      chatId: t.Optional(t.String()),
      assistantId: t.Optional(t.String()),
      modelId: t.Optional(t.String()),
    }),
    detail: {
      summary: 'Stream chat completion',
      description: 'AI SDK compatible streaming endpoint for useChat hook',
    },
  },
)
