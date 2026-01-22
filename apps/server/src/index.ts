import { cors } from '@elysiajs/cors'
import { withHttpLogger } from '@netko/elysia-logger'
import { createLogger } from '@netko/logger'
import { serverEnvConfig } from '@netko/server-config'
import { Elysia } from 'elysia'
import { chatRoutes } from './routes/chat'
import { healthRoutes } from './routes/health'

const logger = createLogger('server')

const app = withHttpLogger(new Elysia())
  .use(cors({ origin: serverEnvConfig.app.cors }))
  .use(healthRoutes)
  .use(chatRoutes)
  .listen(serverEnvConfig.app.port)

logger.info(`Server running at ${app.server?.hostname}:${app.server?.port}`)

export type App = typeof app
