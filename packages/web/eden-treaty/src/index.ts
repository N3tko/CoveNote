import { Elysia } from 'elysia'
import { authRoutes } from './routes/auth'
import { todoRoutes } from './routes/todos'

export const api = new Elysia({ prefix: '/api' }).use(authRoutes).use(todoRoutes)

export type Api = typeof api
