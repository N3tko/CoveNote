import { getChat, getMessagesByChatId, getUserSidebarChats, searchChats } from '@netko/claw-service'
import Elysia from 'elysia'
import { authMacro } from '@/api/macros'
import {
  getChatSchema,
  getMessagesSchema,
  getSidebarChatsSchema,
  searchChatsSchema,
} from './schema'

export const chatRouter = new Elysia({
  prefix: '/chat',
  detail: {
    tags: ['Chat'],
  },
})
  .use(authMacro)
  /**
   * GET /search
   * Search chats by query string
   */
  .get('/search', async ({ user, query }) => await searchChats(user.id, query.query), {
    ...searchChatsSchema,
    auth: true,
  })
  /**
   * GET /sidebar
   * Get chats for sidebar navigation
   */
  .get('/sidebar', async ({ user }) => await getUserSidebarChats(user.id), {
    ...getSidebarChatsSchema,
    auth: true,
  })
  /**
   * GET /:chatId
   * Get a specific chat by ID
   */
  .get('/:chatId', async ({ user, params }) => await getChat(params.chatId, user.id), {
    ...getChatSchema,
    auth: true,
  })
  /**
   * GET /:chatId/messages
   * Get all messages for a specific chat
   */
  .get(
    '/:chatId/messages',
    async ({ user, params }) => await getMessagesByChatId(params.chatId, user.id),
    {
      ...getMessagesSchema,
      auth: true,
    },
  )
