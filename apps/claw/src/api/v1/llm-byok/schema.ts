import { LLMByokInsertSchema, LLMByokSchema, LLMByokUpdateSchema } from '@netko/claw-domain'
import { t } from 'elysia'
import { z } from 'zod'

/**
 * +------------------------+
 * | LLM BYOK Route Schemas |
 * +------------------------+
 *        /\_/\
 *       ( ⌐■_■ ) bring your own keys~
 */

// Shared param schema for routes with :id
const idParamSchema = t.Object({
  id: t.String({ description: 'The LLM BYOK ID' }),
})

/**
 * POST / - Create a new LLM BYOK entry
 */
export const createLLMByokSchema = {
  body: LLMByokInsertSchema,
  response: {
    200: LLMByokSchema.optional(),
  },
  detail: {
    description: 'Create a new LLM BYOK (Bring Your Own Key) entry',
  },
}

/**
 * GET / - Fetch all BYOK entries for the user
 */
export const getUserLLMByoksSchema = {
  response: {
    200: z.array(LLMByokSchema),
  },
  detail: {
    description: 'Retrieve all LLM BYOK entries for the authenticated user',
  },
}

/**
 * PUT /:id - Update an existing LLM BYOK entry
 */
export const updateLLMByokSchema = {
  params: idParamSchema,
  body: LLMByokUpdateSchema,
  response: {
    200: LLMByokSchema.optional(),
  },
  detail: {
    description: 'Update an existing LLM BYOK entry by ID',
  },
}

/**
 * DELETE /:id - Delete an LLM BYOK entry
 */
export const deleteLLMByokSchema = {
  params: idParamSchema,
  response: {
    200: t.Void(),
  },
  detail: {
    description: 'Delete an LLM BYOK entry by ID',
  },
}
