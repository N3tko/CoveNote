import { getAssistants } from '@netko/claw-service'
import { protectedProcedure, router } from '../../init'

export const assistantsQueries = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return getAssistants(ctx)
  }),
})
