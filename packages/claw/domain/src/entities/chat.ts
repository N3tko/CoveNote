import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import { z } from 'zod'
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

// Custom metadata schema that matches MessageMetadata type
const MetadataSchema = z.record(z.string(), z.unknown()).nullable().optional()

/**
 * +---------------------+
 * | Chat Schemas        |
 * +---------------------+
 *        /\_/\
 *       ( o.o )
 */
export const ChatInsertSchema = createInsertSchema(chatTable)
export type ChatInsert = z.infer<typeof ChatInsertSchema>

export const ChatUpdateSchema = createUpdateSchema(chatTable).required({ id: true })
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
export const ChatMessageInsertSchema = createInsertSchema(chatMessageTable, {
  metadata: MetadataSchema,
})
export type ChatMessageInsert = z.infer<typeof ChatMessageInsertSchema>

export const ChatMessageUpdateSchema = createUpdateSchema(chatMessageTable, {
  metadata: MetadataSchema,
}).required({ id: true })
export type ChatMessageUpdate = z.infer<typeof ChatMessageUpdateSchema>

export const ChatMessageSchema = createSelectSchema(chatMessageTable, {
  metadata: MetadataSchema,
})
export type ChatMessage = z.infer<typeof ChatMessageSchema>
