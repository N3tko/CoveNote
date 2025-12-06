import { UserAuthSchema } from '@netko/claw-domain'
import { z } from 'zod'

/**
 * +------------------------+
 * | Users Route Schemas    |
 * +------------------------+
 *        /\_/\
 *       ( o.o ) who dis?
 */

/**
 * GET /me - Returns the authenticated user's profile
 */
export const getMeSchema = {
  response: {
    200: UserAuthSchema,
  },
  detail: {
    description: "Retrieve the currently authenticated user's profile data",
  },
}

/**
 * GET /auth-methods - Returns enabled social auth providers
 */
export const getAuthMethodsSchema = {
  response: {
    200: z.array(z.string()),
  },
  detail: {
    description: 'Retrieve a list of enabled social authentication provider identifiers',
  },
}
