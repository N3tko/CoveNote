import { auth } from '@netko/web-service'
import { Elysia } from 'elysia'

export const authMiddleware = new Elysia({ name: 'auth' }).derive(async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers })
  return {
    user: session?.user ?? null,
    session: session?.session ?? null,
  }
})

export const protectedRoute = new Elysia({ name: 'protected' })
  .use(authMiddleware)
  .onBeforeHandle(({ user }) => {
    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }
  })
