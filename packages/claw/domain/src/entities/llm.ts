import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import type { z } from 'zod'
import { llmAssistantTable, llmModelTable, llmProviderEnum } from '../db'

/**
 * +---------------------+
 * | LLM Provider Enum   |
 * +---------------------+
 *        /\_/\
 *       ( o.o )
 */
export const LLMProviderEnum = createSelectSchema(llmProviderEnum)
export type LLMProvider = z.infer<typeof LLMProviderEnum>

/**
 * +---------------------+
 * | LLM Model Schemas   |
 * +---------------------+
 *        /\_/\
 *       ( o.o )
 */
export const LLMModelInsertSchema = createInsertSchema(llmModelTable)
export type LLMModelInsert = z.infer<typeof LLMModelInsertSchema>

export const LLMModelUpdateSchema = createUpdateSchema(llmModelTable).required({ id: true })
export type LLMModelUpdate = z.infer<typeof LLMModelUpdateSchema>

export const LLMModelSchema = createSelectSchema(llmModelTable)
export type LLMModel = z.infer<typeof LLMModelSchema>

/**
 * +---------------------+
 * | LLM Assistant Schemas   |
 * +---------------------+
 *        /\_/\
 *       ( o.o )
 */
export const LLMAssistantInsertSchema = createInsertSchema(llmAssistantTable)
export type LLMAssistantInsert = z.infer<typeof LLMAssistantInsertSchema>

export const LLMAssistantUpdateSchema = createUpdateSchema(llmAssistantTable).required({ id: true })
export type LLMAssistantUpdate = z.infer<typeof LLMAssistantUpdateSchema>

export const LLMAssistantSchema = createSelectSchema(llmAssistantTable)
export type LLMAssistant = z.infer<typeof LLMAssistantSchema>
