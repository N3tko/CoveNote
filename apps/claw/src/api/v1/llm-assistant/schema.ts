import { LLMAssistantSchema } from '@netko/claw-domain'
import { z } from 'zod'

/**
 * +------------------------------+
 * | LLM Assistants Route Schemas |
 * +------------------------------+
 *        /\_/\
 *       ( ◕‿◕ ) at your service~
 */

/**
 * GET / - Get available assistants
 */
export const getAssistantsSchema = {
  response: {
    200: z.array(LLMAssistantSchema),
  },
  detail: {
    description: 'Retrieve all available LLM assistants for the authenticated user',
  },
}

