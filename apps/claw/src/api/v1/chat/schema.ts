import { ChatMessageSchema, ChatSchema } from '@netko/claw-domain'
import { t } from 'elysia'
import { z } from 'zod'

/**
 * +------------------------+
 * | Chat Route Schemas     |
 * +------------------------+
 *        /\_/\
 *       ( >ω< ) let's chat!
 */

/**
 * GET /search - Search chats by query
 */
export const searchChatsSchema = {
  query: t.Object({
    query: t.String({ description: 'Search query string' }),
  }),
  response: {
    200: z.array(ChatSchema),
  },
  detail: {
    description: 'Search chats by query string',
  },
}

/**
 * GET /sidebar - Get sidebar chats
 */
export const getSidebarChatsSchema = {
  response: {
    200: z.array(ChatSchema),
  },
  detail: {
    description: 'Retrieve chats for the sidebar navigation',
  },
}

/**
 * GET /:chatId - Get a specific chat
 */
export const getChatSchema = {
  params: t.Object({
    chatId: t.String({ description: 'The chat ID' }),
  }),
  response: {
    200: ChatSchema.optional(),
  },
  detail: {
    description: 'Retrieve a specific chat by ID',
  },
}

/**
 * GET /:chatId/messages - Get messages for a chat
 */
export const getMessagesSchema = {
  params: t.Object({
    chatId: t.String({ description: 'The chat ID' }),
  }),
  response: {
    200: z.array(ChatMessageSchema),
  },
  detail: {
    description: 'Retrieve all messages for a specific chat',
  },
}
