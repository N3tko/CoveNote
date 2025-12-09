import type { Context } from '@netko/claw-domain'
import { createLogger } from '@netko/logger'
import { auth } from '@netko/claw-service'
import { initTRPC, TRPCError } from '@trpc/server'
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import superjson from 'superjson'

const logger = createLogger('trpc')

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => {
    // Log all tRPC errors with context
    logger.error(
      {
        code: shape.code,
        path: shape.data?.path,
        httpStatus: shape.data?.httpStatus,
        err: error.message,
        cause: error.cause instanceof Error ? error.cause.message : undefined,
      },
      `tRPC error: ${error.message}`,
    )
    return shape
  },
})

export const router = t.router
export const mergeRouters = t.mergeRouters

//* Context
export const createContext = async ({ req }: FetchCreateContextFnOptions): Promise<Context> => {
  const authResponse = await auth.api.getSession({
    headers: req.headers,
  })

  if (!authResponse?.session && !authResponse?.user) {
    return {
      user: null,
      session: null,
    }
  }

  return {
    user: authResponse.user,
    session: authResponse.session,
  }
}

//* Procedures
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(async ({ next, ctx }) => {
  const { user, session } = ctx
  if (!session || !user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({ ctx: { user, session } })
})
