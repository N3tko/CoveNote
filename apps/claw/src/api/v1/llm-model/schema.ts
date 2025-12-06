import { LLMModelInsertSchema, LLMModelSchema, LLMModelUpdateSchema } from '@netko/claw-domain'
import { t } from 'elysia'
import { z } from 'zod'

/**
 * +---------------------------+
 * | LLM Models Route Schemas  |
 * +---------------------------+
 *        /\_/\
 *       ( ^.^ ) meow~
 */

// Shared param schema for routes with :id
const idParamSchema = t.Object({
  id: t.String({ description: 'The LLM Model ID' }),
})

/**
 * POST / - Create a new LLM Model
 */
export const createLLMModelSchema = {
  body: LLMModelInsertSchema,
  response: {
    200: LLMModelSchema.optional(),
  },
  detail: {
    description: 'Create a new LLM Model',
  },
}

/**
 * GET /available - Fetch all available LLM Models for the user
 */
export const getAvailableLLMModelsSchema = {
  response: {
    200: z.array(LLMModelSchema),
  },
  detail: {
    description: 'Retrieve all available LLM Models for the authenticated user',
  },
}

/**
 * GET /active - Fetch all active LLM Models for the user
 */
export const getActiveLLMModelsSchema = {
  response: {
    200: z.array(LLMModelSchema),
  },
  detail: {
    description: 'Retrieve all active LLM Models for the authenticated user',
  },
}

/**
 * PUT /:id - Update an existing LLM Model
 */
export const updateLLMModelSchema = {
  params: idParamSchema,
  body: LLMModelUpdateSchema,
  response: {
    200: LLMModelSchema.optional(),
  },
  detail: {
    description: 'Update an existing LLM Model by ID',
  },
}

/**
 * DELETE /:id - Delete an LLM Model
 */
export const deleteLLMModelSchema = {
  params: idParamSchema,
  response: {
    200: t.Void(),
  },
  detail: {
    description: 'Delete an LLM Model by ID',
  },
}
