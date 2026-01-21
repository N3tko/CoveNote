import { auth } from '@netko/claw-service'
import { createLogger } from '@netko/logger'
import { Elysia } from 'elysia'

const logger = createLogger('api-context')

/**
 * Auth macro plugin - provides the auth macro for protected routes
 * Use this in route files to enable the { auth: true } option
 */
export const authMacro = new Elysia({ name: 'auth-macro' }).macro({
  auth: {
    async resolve({ status, request: { headers } }) {
      try {
        logger.debug('Auth macro resolving session')
        const session = await auth.api.getSession({ headers })
        if (!session) {
          logger.debug('No session found, returning 401')
          return status(401)
        }
        logger.debug({ userId: session.user.id }, 'Session resolved successfully')
        return {
          user: session.user,
          session: session.session,
        }
      } catch (err) {
        logger.error({ error: err }, 'Error in auth macro')
        return status(401)
      }
    },
  },
})

/**
 * Better Auth plugin with handler mount AND macro
 * Use this at the top level of the API to mount /auth/* and provide the macro
 */
export const betterAuth = new Elysia({ name: 'better-auth' })
  .mount('/auth', auth.handler)
  .use(authMacro)
