import { boolean, pgEnum, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { userTable } from './auth'

/**
 * +---------------------+
 * | LLM Schemas         |
 * +---------------------+
 *        /\_/\
 *       ( o.o )
 */
export const llmProviderEnum = pgEnum('provider', ['openai', 'ollama', 'openrouter', 'custom'])

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
  createdBy: text('created_by').references(() => userTable.id, { onDelete: 'cascade' }),
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
 * | LLM BYOK Table     |
 * +---------------------+
 *        /\_/\
 *       ( o.o )
 */
export const llmByokTable = pgTable(
  'llm_byok',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => Bun.randomUUIDv7().toString()),
    provider: llmProviderEnum('provider').notNull(),
    encryptedKey: text('encrypted_key').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdBy: text('created_by')
      .references(() => userTable.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at')
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp('updated_at')
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    {
      unique: unique('user_provider_unique').on(table.provider, table.createdBy),
    },
  ],
)

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
  createdBy: text('created_by').references(() => userTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: timestamp('deleted_at'),
})
