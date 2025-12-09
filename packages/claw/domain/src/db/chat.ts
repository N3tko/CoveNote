import { jsonb, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { user } from './auth'
import { llmAssistantTable, llmModelTable } from './llm'

/**
 * +---------------------+
 * | Chat Schemas         |
 * +---------------------+
 *        /\_/\
 *       ( o.o )
 */
export const messageRoleEnum = pgEnum('message_role', ['user', 'assistant', 'system'])

export type MessageMetadata = Record<string, unknown> | null

/**
 * +---------------------+
 * | Chat Table          |
 * +---------------------+
 *        /\_/\
 *       ( o.o )
 */
export const chatTable = pgTable('chat', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7().toString()),
  title: text('title').notNull(),
  selectedAssistant: uuid('selected_assistant').references(() => llmAssistantTable.id),
  selectedModel: uuid('selected_model').references(() => llmModelTable.id),
  createdBy: text('created_by').references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
})

/**
 * +---------------------+
 * | Message Table       |
 * +---------------------+
 *        /\_/\
 *       ( o.o )
 */
export const chatMessageTable = pgTable('chat_message', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7().toString()),
  chatId: uuid('chat_id').references(() => chatTable.id, { onDelete: 'cascade' }),
  assistantId: uuid('assistant_id').references(() => llmAssistantTable.id),
  modelId: uuid('model_id').references(() => llmModelTable.id),
  content: text('content').notNull(),
  role: messageRoleEnum('role').notNull(),
  metadata: jsonb('metadata').$type<MessageMetadata>(),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
})
