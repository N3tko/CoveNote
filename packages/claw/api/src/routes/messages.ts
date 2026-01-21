import {
  getAssistantById,
  getChat,
  getLLMModelById,
  getMessagesByChatId,
  getUserByokByProvider,
  processLLMStream,
  sendMessage,
} from '@netko/claw-service'
import { createLogger } from '@netko/logger'
import { RedisClient } from 'bun'
import { Elysia, t } from 'elysia'
import { authMacro } from '../context'

const logger = createLogger('messages-api')

/**
 * Message routes with SSE streaming support
 */
export const messageRoutes = new Elysia({ prefix: '/chats/:id/messages' })
  .use(authMacro)
  .get(
    '/',
    async ({ params, user, session, set }) => {
      // Verify chat ownership
      const chat = await getChat(params.id, { user, session })
      if (!chat) {
        set.status = 404
        return { error: 'Chat not found' }
      }
      return getMessagesByChatId(params.id, { user, session })
    },
    {
      auth: true,
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: 'Get messages by chat ID',
      },
    },
  )
  .post(
    '/',
    async ({ params, body, user, session, set }) => {
      // Verify chat ownership
      const chat = await getChat(params.id, { user, session })
      if (!chat) {
        set.status = 404
        return { error: 'Chat not found' }
      }

      // Get model for provider lookup
      const model = body.modelId ? await getLLMModelById(body.modelId) : null
      if (!model) {
        set.status = 400
        return { error: 'Model not found' }
      }

      // Get BYOK for the model's provider
      const byok = await getUserByokByProvider(user.id, model.provider)
      if (!byok?.decryptedKey) {
        set.status = 400
        return { error: `No API key configured for ${model.provider}` }
      }

      // Get assistant if specified
      const assistant = body.assistantId ? await getAssistantById(body.assistantId) : null

      // Send user message
      const userMessage = await sendMessage(
        {
          chatId: params.id,
          content: body.content,
          assistantId: body.assistantId,
          modelId: body.modelId,
        },
        { user, session },
      )

      // Get all messages for context
      const messages = await getMessagesByChatId(params.id, { user, session })

      // Start AI stream processing in background
      processLLMStream(
        {
          chatId: params.id,
          userMessageId: userMessage.id,
          assistantId: body.assistantId,
          modelId: body.modelId,
          apiKey: byok.decryptedKey!,
          systemPrompt: assistant?.systemPrompt ?? undefined,
          ctx: { user, session },
        },
        messages,
        model,
      ).catch((err) => {
        logger.error({ error: err, chatId: params.id }, 'Error in LLM stream processing')
      })

      return userMessage
    },
    {
      auth: true,
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        content: t.String(),
        assistantId: t.Optional(t.String()),
        modelId: t.Optional(t.String()),
      }),
      detail: {
        summary: 'Send a message',
        description: 'Sends a user message and triggers AI response generation',
      },
    },
  )
  .get(
    '/stream',
    async ({ params, user, session, set }) => {
      // Verify chat ownership
      const chat = await getChat(params.id, { user, session })
      if (!chat) {
        set.status = 404
        return { error: 'Chat not found' }
      }

      const chatId = params.id
      const channel = `chat:${chatId}`

      // Use environment variable directly
      const redisUrl = process.env.CACHE_URL
      if (!redisUrl) {
        set.status = 500
        return { error: 'Redis not configured' }
      }

      // Create SSE stream
      const stream = new ReadableStream({
        async start(controller) {
          const subscriber = new RedisClient(redisUrl)
          await subscriber.connect()

          const encoder = new TextEncoder()
          let isStreamOpen = true

          // Send initial connection event
          controller.enqueue(encoder.encode(`event: connected\ndata: {"chatId":"${chatId}"}\n\n`))

          // Subscribe to chat channel
          await subscriber.subscribe(channel, (message: string) => {
            if (!isStreamOpen) return

            try {
              const data = JSON.parse(message)
              const eventData = `event: ${data.type}\ndata: ${JSON.stringify(data)}\n\n`
              controller.enqueue(encoder.encode(eventData))
            } catch (err) {
              logger.error({ error: err }, 'Error parsing Redis message')
            }
          })

          // Keep connection alive with heartbeat
          const heartbeat = setInterval(() => {
            if (!isStreamOpen) {
              clearInterval(heartbeat)
              return
            }
            controller.enqueue(encoder.encode(': heartbeat\n\n'))
          }, 30000)

          // Cleanup on close - this is handled by the AbortSignal
          return () => {
            isStreamOpen = false
            clearInterval(heartbeat)
            subscriber.unsubscribe(channel).catch(() => {})
            subscriber.close()
          }
        },
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      })
    },
    {
      auth: true,
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: 'Subscribe to message stream',
        description: 'SSE endpoint for real-time message updates',
      },
    },
  )
