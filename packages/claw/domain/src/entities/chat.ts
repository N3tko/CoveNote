import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import type { z } from 'zod'
import { chatMessageTable, chatTable, messageRoleEnum } from '../db'

/**
 * +---------------------+
 * | Message Role Enum   |
 * +---------------------+
 *        /\_/\
 *       ( o.o )
 */
export const MessageRoleEnum = createSelectSchema(messageRoleEnum)
export type MessageRole = z.infer<typeof MessageRoleEnum>

/**
 * +---------------------+
 * | Chat Schemas        |
 * +---------------------+
 *        /\_/\
 *       ( o.o )
 */
export const ChatInsertSchema = createInsertSchema(chatTable)
export type ChatInsert = z.infer<typeof ChatInsertSchema>

export const ChatUpdateSchema = createUpdateSchema(chatTable)
export type ChatUpdate = z.infer<typeof ChatUpdateSchema>

export const ChatSchema = createSelectSchema(chatTable)
export type Chat = z.infer<typeof ChatSchema>

/**
 * +---------------------+
 * | Chat Message Schemas|
 * +---------------------+
 *        /\_/\
 *       ( o.o )
 */
export const ChatMessageInsertSchema = createInsertSchema(chatMessageTable)
export type ChatMessageInsert = z.infer<typeof ChatMessageInsertSchema>

export const ChatMessageUpdateSchema = createUpdateSchema(chatMessageTable)
export type ChatMessageUpdate = z.infer<typeof ChatMessageUpdateSchema>

export const ChatMessageSchema = createSelectSchema(chatMessageTable)
export type ChatMessage = z.infer<typeof ChatMessageSchema>
