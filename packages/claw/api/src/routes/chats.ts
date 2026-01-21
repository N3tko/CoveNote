import {
  createChat,
  getChat,
  getUserSidebarChats,
  searchChats,
  updateChat,
} from '@netko/claw-service'
import { Elysia, t } from 'elysia'
import { authMacro } from '../context'

/**
 * Chat routes
 */
export const chatRoutes = new Elysia({ prefix: '/chats' })
  .use(authMacro)
  .get(
    '/',
    async ({ user, query }) => {
      if (query.search) {
        return searchChats(query.search, user.id)
      }
      return getUserSidebarChats(user.id)
    },
    {
      auth: true,
      query: t.Object({
        search: t.Optional(t.String()),
      }),
      detail: {
        summary: 'Get user chats',
        description: 'Returns all user chats, optionally filtered by search query',
      },
    },
  )
  .get(
    '/:id',
    async ({ params, user, session, set }) => {
      const chat = await getChat(params.id, { user, session })
      if (!chat) {
        set.status = 404
        return { error: 'Chat not found' }
      }
      return chat
    },
    {
      auth: true,
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: 'Get chat by ID',
      },
    },
  )
  .post(
    '/',
    async ({ body, user, set }) => {
      const chat = await createChat({
        title: body.title,
        createdBy: user.id,
        selectedAssistant: body.selectedAssistant,
        selectedModel: body.selectedModel,
      })
      if (!chat) {
        set.status = 500
        return { error: 'Failed to create chat' }
      }
      return chat
    },
    {
      auth: true,
      body: t.Object({
        title: t.String(),
        selectedAssistant: t.Optional(t.String()),
        selectedModel: t.Optional(t.String()),
      }),
      detail: {
        summary: 'Create a new chat',
      },
    },
  )
  .patch(
    '/:id',
    async ({ params, body, user, session, set }) => {
      const chat = await updateChat(params.id, body, { user, session })
      if (!chat) {
        set.status = 404
        return { error: 'Chat not found or unauthorized' }
      }
      return chat
    },
    {
      auth: true,
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        title: t.Optional(t.String()),
        selectedAssistant: t.Optional(t.Nullable(t.String())),
        selectedModel: t.Optional(t.Nullable(t.String())),
      }),
      detail: {
        summary: 'Update chat',
      },
    },
  )
