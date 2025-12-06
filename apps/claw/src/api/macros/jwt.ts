import { validateToken } from '@netko/claw-service'
import { Elysia } from 'elysia'

export const jwtAuthMacro = new Elysia({ name: 'jwtAuth' }).macro({
  jwt: {
    async resolve({ status, headers: { authorization } }) {
      const token = authorization?.replace('Bearer ', '')

      if (!token) return status(401)

      const payload = await validateToken(token)

      if (!payload) return status(401)

      return { user: payload }
    },
  },
})
