import { EventEmitter } from 'node:events'
import { createLogger } from '@netko/logger'

const logger = createLogger('events')

/**
 * ✧･ﾟ: *✧･ﾟ:* CHAT EVENT EMITTER *:･ﾟ✧*:･ﾟ✧
 *
 * In-memory event emitter for real-time chat updates.
 * Simple, fast, and works great for single-server deployments! (◕‿◕✿)
 *
 * Note: For multi-server deployments, consider using Redis pub/sub instead.
 */
export const chatEvents = new EventEmitter()

// Support many concurrent connections
chatEvents.setMaxListeners(1000)

/**
 * Event payload types for chat messages
 */
export type ChatEventType =
  | 'message_created'
  | 'message_streaming'
  | 'message_completed'
  | 'message_error'

export interface ChatEventMessage {
  id: string
  chatId: string
  role: string
  content: string
  createdAt: string // ISO string for proper serialization
  [key: string]: unknown
}

export interface ChatEventPayload {
  type: ChatEventType
  timestamp: number
  messageId?: string
  content?: string
  message?: ChatEventMessage
  error?: string
}

/**
 * Build a channel name for a specific chat and user
 */
export function getChatChannel(chatId: string, userId: string): string {
  return `chat:${chatId}:${userId}`
}

/**
 * Emit a chat event to a specific user's subscription
 *
 * @param chatId - The chat/conversation ID
 * @param userId - The user ID to notify
 * @param event - The event payload
 */
export function emitChatEvent(chatId: string, userId: string, event: ChatEventPayload): void {
  const channel = getChatChannel(chatId, userId)
  logger.debug({ channel, type: event.type }, 'emitting event')
  chatEvents.emit(channel, event)
}

/**
 * Helper to convert Date to ISO string
 */
function toISOString(date: Date | string | number | undefined): string {
  if (!date) return new Date().toISOString()
  if (date instanceof Date) return date.toISOString()
  if (typeof date === 'number') return new Date(date).toISOString()
  return date
}

/**
 * Emit a message created event
 */
export function emitMessageCreated(
  chatId: string,
  userId: string,
  message: {
    id: string
    chatId: string
    role: string
    content: string
    createdAt: Date | string | number
  },
): void {
  emitChatEvent(chatId, userId, {
    type: 'message_created',
    timestamp: Date.now(),
    messageId: message.id,
    message: {
      ...message,
      createdAt: toISOString(message.createdAt),
    },
  })
}

/**
 * Emit a streaming content update
 */
export function emitMessageStreaming(
  chatId: string,
  userId: string,
  messageId: string,
  content: string,
): void {
  emitChatEvent(chatId, userId, {
    type: 'message_streaming',
    timestamp: Date.now(),
    messageId,
    content,
  })
}

/**
 * Emit a message completed event
 */
export function emitMessageCompleted(
  chatId: string,
  userId: string,
  message: {
    id: string
    chatId: string
    role: string
    content: string
    createdAt: Date | string | number
  },
): void {
  emitChatEvent(chatId, userId, {
    type: 'message_completed',
    timestamp: Date.now(),
    messageId: message.id,
    message: {
      ...message,
      createdAt: toISOString(message.createdAt),
    },
  })
}

/**
 * Emit a message error event
 */
export function emitMessageError(chatId: string, userId: string, error: string): void {
  emitChatEvent(chatId, userId, {
    type: 'message_error',
    timestamp: Date.now(),
    error,
  })
}
