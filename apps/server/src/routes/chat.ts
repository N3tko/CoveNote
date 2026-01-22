import { getMessages, saveMessage } from '@netko/server-service'
import { Elysia, t } from 'elysia'

export const chatRoutes = new Elysia({ prefix: '/chat' })
  .get(
    '/history',
    async ({ query }) => {
      const limit = query.limit ?? 50
      return await getMessages(limit)
    },
    {
      query: t.Object({
        limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
      }),
    },
  )
  .ws('/ws', {
    body: t.Object({
      username: t.String(),
      message: t.String(),
    }),
    open(ws) {
      ws.subscribe('chat')
    },
    async message(ws, { message, username }) {
      const saved = await saveMessage({ username, message })
      ws.publish('chat', {
        ...saved,
        timestamp: Date.now(),
      })
      ws.send({
        ...saved,
        timestamp: Date.now(),
      })
    },
    close(ws) {
      ws.unsubscribe('chat')
    },
  })
