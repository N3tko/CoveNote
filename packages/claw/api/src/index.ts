import { createLogger } from '@netko/logger'
import { Elysia } from 'elysia'
import { betterAuth } from './context'
import {
  assistantRoutes,
  byokRoutes,
  chatRoutes,
  chatStreamRoutes,
  messageRoutes,
  modelRoutes,
} from './routes'

const logger = createLogger('api')

/**
 * Main Elysia API application
 * All routes are prefixed with /api
 */
export const api = new Elysia({ prefix: '/api' })
  .onError(({ code, error, path }) => {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    logger.error({ code, error: errorMessage, stack: errorStack, path }, 'API Error')
    return {
      error: errorMessage,
      code,
      path,
    }
  })
  .use(betterAuth)
  .use(assistantRoutes)
  .use(byokRoutes)
  .use(chatRoutes)
  .use(chatStreamRoutes)
  .use(messageRoutes)
  .use(modelRoutes)

/**
 * Type export for Eden Treaty client generation
 */
export type Api = typeof api

// Re-export context for external use
export { authMacro, betterAuth } from './context'
