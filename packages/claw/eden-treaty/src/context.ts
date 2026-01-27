import { auth } from '@covenote/claw-service'
import { Elysia } from 'elysia'

export const protectedRoute = new Elysia({ name: 'protected' }).mount(auth.handler).macro({
  auth: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({
        headers,
      })

      if (!session) return status(401)

      return {
        user: session.user,
        session: session.session,
      }
    },
  },
})
