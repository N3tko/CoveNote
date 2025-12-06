import { Elysia } from 'elysia'
import { jwtAuthMacro } from '@/api/macros'

export const wsRouter = new Elysia({
  prefix: '/ws',
})
  .use(jwtAuthMacro)
  .ws('/', {
    jwt: true,
    open(ws) {
      const { user } = ws.data
      if (!user) {
        return ws.close(1008, 'Unauthorized')
      }
    },
  })
