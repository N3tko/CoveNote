import type { AuthenticatedContext, ChatMessage, ChatMessageInsert } from '@netko/claw-domain'
import { chatMessageTable } from '@netko/claw-domain'
import { db } from '@netko/claw-repository'
import { createLogger } from '@netko/logger'
import { RedisClient } from 'bun'

const logger = createLogger('send-message')

/**
 * Send a message and save it to the database
 * Publishes message event to Redis for real-time sync
 * Returns the saved message
 */
export const sendMessage = async (
  data: Omit<ChatMessageInsert, 'id' | 'role' | 'createdAt' | 'updatedAt'>,
  _ctx: AuthenticatedContext,
): Promise<ChatMessage> => {
  // Save message to database
  const message = await db
    .insert(chatMessageTable)
    .values({
      ...data,
      role: 'user',
    })
    .returning()
    .then(([result]) => result)

  if (!message) {
    throw new Error('Failed to save message to database')
  }

  // Publish message event to Redis for real-time sync
  try {
    const publisher = new RedisClient()

    const channel = `chat:${data.chatId}`

    await publisher.publish(
      channel,
      JSON.stringify({
        id: message?.eventId,
        type: 'message_created',
        message,
      }),
    )

    publisher.close()
    logger.debug(
      { chatId: data.chatId, messageId: message?.id },
      'Published message event to Redis',
    )
  } catch (error) {
    // Don't fail the mutation if Redis publish fails
    logger.error({ error, chatId: data.chatId }, 'Failed to publish message event to Redis')
  }

  return message
}
