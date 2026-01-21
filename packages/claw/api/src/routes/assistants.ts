import { getAssistantById, getAssistants } from '@netko/claw-service'
import { Elysia, t } from 'elysia'
import { authMacro } from '../context'

/**
 * Assistant routes
 */
export const assistantRoutes = new Elysia({ prefix: '/assistants' })
  .use(authMacro)
  .get(
    '/',
    async ({ user, session }) => {
      const assistants = await getAssistants({ user, session })
      return assistants
    },
    {
      auth: true,
      detail: {
        summary: 'Get all assistants',
        description: 'Returns all public assistants and user-created assistants',
      },
    },
  )
  .get(
    '/:id',
    async ({ params, set }) => {
      const assistant = await getAssistantById(params.id)
      if (!assistant) {
        set.status = 404
        return { error: 'Assistant not found' }
      }
      return assistant
    },
    {
      auth: true,
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: 'Get assistant by ID',
      },
    },
  )
