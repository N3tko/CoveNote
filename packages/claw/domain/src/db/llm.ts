import { boolean, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { user } from './auth'

/**
 * +---------------------+
 * | LLM Schemas         |
 * +---------------------+
 *        /\_/\
 *       ( o.o )
 */
export const llmProviderEnum = pgEnum('provider', ['openai', 'anthropic', 'google'])

/**
 * +---------------------+
 * | LLM Model Table     |
 * +---------------------+
 *        /\_/\
 *       ( o.o )
 */
export const llmModelTable = pgTable('llm_model', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7().toString()),
  slug: text('slug').notNull(),
  name: text('name').notNull(),
  provider: llmProviderEnum('provider').notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  isPublic: boolean('is_public').notNull().default(false),
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
 * | LLM ASSISTANT Table |
 * +---------------------+
 *        /\_/\
 *       ( o.o )
 */
export const llmAssistantTable = pgTable('llm_assistant', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7().toString()),
  name: text('name').notNull(),
  description: text('description'),
  isPublic: boolean('is_public').notNull().default(false),
  systemPrompt: text('system_prompt').notNull(),
  createdBy: text('created_by').references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: timestamp('deleted_at'),
})
