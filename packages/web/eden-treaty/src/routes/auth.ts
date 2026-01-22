import { auth } from '@netko/web-service'
import { Elysia } from 'elysia'

export const authRoutes = new Elysia({ prefix: '/auth' }).all('/*', ({ request }) =>
  auth.handler(request),
)
