import { Elysia } from 'elysia'
import { authRoutes } from './routes/auth'
import { configRoutes } from './routes/config'

export const api = new Elysia({ prefix: '/api' }).use(authRoutes).use(configRoutes)

export type Api = typeof api
