import { getAssistants } from '@netko/claw-service'
import Elysia from 'elysia'
import { authMacro } from '@/api/macros'
import { getAssistantsSchema } from './schema'

export const llmAssistantsRouter = new Elysia({
  prefix: '/llm-assistants',
  detail: {
    tags: ['LLM Assistants'],
  },
})
  .use(authMacro)
  /**
   * GET /
   * Get available LLM assistants
   */
  .get('/', async ({ user }) => await getAssistants(user.id), {
    ...getAssistantsSchema,
    auth: true,
  })
