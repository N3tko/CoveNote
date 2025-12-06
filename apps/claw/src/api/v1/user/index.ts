import { clawEnvConfig } from '@netko/claw-config'
import Elysia from 'elysia'
import { authMacro } from '../../macros'
import { getAuthMethodsSchema, getMeSchema } from './schema'

/**
 * Users Router
 *
 * Handles user profile and authentication-related endpoints.
 *
 * @prefix /users
 */
export const usersRouter = new Elysia({
  prefix: '/users',
  detail: {
    tags: ['Users'],
  },
})
  .use(authMacro)
  /**
   * GET /me
   *
   * Returns the currently authenticated user's profile data.
   *
   * @auth Required
   * @returns User object containing profile information
   * @throws 401 Unauthorized if no valid session exists
   */
  .get(
    '/me',
    ({ user }) => {
      return user
    },
    { ...getMeSchema, auth: true },
  )
  /**
   * GET /auth-methods
   *
   * Returns a list of enabled social authentication providers.
   *
   * @auth Not required
   * @returns string[] - Array of enabled provider identifiers
   * @example ["github", "google"]
   */
  .get(
    '/auth-methods',
    () => {
      return Object.entries(clawEnvConfig.auth.socialProviders)
        .filter(([_, value]) => value?.enabled)
        .map(([key]) => key)
    },
    { ...getAuthMethodsSchema, auth: false },
  )
