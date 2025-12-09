import { ChatMessageInsertSchema } from '@netko/claw-domain'
import {
  createMessage,
  generateResponse,
  getAssistantById,
  getLLMModelById,
  getMessagesByChatId,
  getUserByokByProvider,
} from '@netko/claw-service'
import { createLogger } from '@netko/logger'
import {
  emitMessageCompleted,
  emitMessageCreated,
  emitMessageError,
  emitMessageStreaming,
} from '../../events'
import { protectedProcedure, router } from '../../init'

const logger = createLogger('messages')

export const messagesMutations = router({
  create: protectedProcedure.input(ChatMessageInsertSchema).mutation(async ({ input, ctx }) => {
    const { chatId, assistantId, modelId } = input

    logger.info({ chatId, role: input.role }, 'creating message')

    // Save the user message first
    const userMessage = await createMessage(input)

    if (!userMessage) {
      logger.error({ chatId }, 'failed to create user message')
      throw new Error('Failed to create message')
    }

    // Emit the user message created event
    if (chatId) {
      emitMessageCreated(chatId, ctx.user.id, {
        id: userMessage.id,
        chatId,
        role: userMessage.role,
        content: userMessage.content,
        createdAt: userMessage.createdAt,
      })
    }

    // If this is a user message, trigger AI generation
    if (input.role === 'user' && chatId && assistantId && modelId) {
      logger.info({ chatId, assistantId, modelId }, 'triggering AI generation')

      // Fetch required data in parallel
      const [assistant, model, previousMessages] = await Promise.all([
        getAssistantById(assistantId),
        getLLMModelById(modelId),
        getMessagesByChatId(chatId, ctx),
      ])

      if (!assistant) {
        logger.error({ assistantId }, 'assistant not found')
        emitMessageError(chatId, ctx.user.id, 'Assistant not found')
        return userMessage
      }

      if (!model) {
        logger.error({ modelId }, 'model not found')
        emitMessageError(chatId, ctx.user.id, 'Model not found')
        return userMessage
      }

      // Get user's API key for the model's provider
      const apiKey = await getUserByokByProvider(ctx.user.id, model.provider)

      if (!apiKey || !apiKey.decryptedKey) {
        logger.error({ provider: model.provider }, 'API key not found')
        emitMessageError(chatId, ctx.user.id, `No API key configured for ${model.provider}`)
        return userMessage
      }

      // Convert messages to AI format
      const aiMessages = previousMessages.map((msg) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      }))

      // Generate AI response (async, don't wait)
      generateResponse({
        chatId,
        userId: ctx.user.id,
        messages: aiMessages,
        model,
        assistant,
        apiKey,
        onMessageCreated: (tempId) => {
          logger.debug({ chatId, tempId }, 'AI message started')
          emitMessageCreated(chatId, ctx.user.id, {
            id: tempId,
            chatId,
            role: 'assistant',
            content: '',
            createdAt: new Date(),
          })
        },
        onStreaming: (tempId, content) => {
          emitMessageStreaming(chatId, ctx.user.id, tempId, content)
        },
        onCompleted: async (completedMessage) => {
          logger.info(
            { chatId, contentLength: completedMessage.content.length },
            'AI generation completed',
          )

          // Save the assistant message to DB
          const savedMessage = await createMessage({
            chatId,
            role: 'assistant',
            content: completedMessage.content,
            assistantId,
            modelId,
          })

          if (savedMessage) {
            emitMessageCompleted(chatId, ctx.user.id, {
              id: savedMessage.id,
              chatId,
              role: savedMessage.role,
              content: savedMessage.content,
              createdAt: savedMessage.createdAt,
            })
          }
        },
        onError: (error) => {
          logger.error({ chatId, err: error }, 'AI generation failed')
          emitMessageError(chatId, ctx.user.id, error)
        },
      }).catch((error) => {
        logger.error({ chatId, err: error }, 'AI generation promise rejected')
        emitMessageError(chatId, ctx.user.id, String(error))
      })
    }

    return userMessage
  }),
})
