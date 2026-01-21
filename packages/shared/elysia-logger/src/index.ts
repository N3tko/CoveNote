import { createLogger } from '@netko/logger'
import type { Elysia } from 'elysia'

// Store request start times
const requestTimes = new WeakMap<Request, number>()

/**
 * Get error message safely from various error types
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message)
  }
  return 'Unknown error'
}

/**
 * Add HTTP logging to an Elysia app
 *
 * @param app - The Elysia app instance
 * @param namespace - Optional namespace for the logger (default: 'http')
 * @returns The same app instance with logging hooks added
 *
 * @example
 * ```ts
 * import { Elysia } from 'elysia'
 * import { withHttpLogger } from '@netko/elysia-logger'
 *
 * const app = withHttpLogger(new Elysia())
 *   .get('/', () => 'Hello')
 *   .listen(3000)
 * ```
 */
export function withHttpLogger<T extends Elysia>(app: T, namespace = 'http'): T {
  const logger = createLogger(namespace)

  return app
    .onRequest(({ request }) => {
      requestTimes.set(request, performance.now())
    })
    .onAfterResponse(({ request, set }) => {
      const startTime = requestTimes.get(request) ?? performance.now()
      const duration = Math.round(performance.now() - startTime)
      const url = new URL(request.url)
      const method = request.method
      const path = url.pathname
      const status = typeof set.status === 'number' ? set.status : 200

      logger.info({ method, path, status, duration }, `${method} ${path}`)
      requestTimes.delete(request)
    })
    .onError(({ request, error, set }) => {
      const startTime = requestTimes.get(request) ?? performance.now()
      const duration = Math.round(performance.now() - startTime)
      const url = new URL(request.url)
      const method = request.method
      const path = url.pathname
      const status = typeof set.status === 'number' ? set.status : 500
      const errorMessage = getErrorMessage(error)

      logger.error(
        { method, path, status, duration, error: errorMessage },
        `${method} ${path} - ${errorMessage}`,
      )
      requestTimes.delete(request)
    }) as T
}

export default withHttpLogger
