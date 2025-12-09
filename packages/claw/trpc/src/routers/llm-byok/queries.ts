import { getUserLLMByoks } from '@netko/claw-service'
import { protectedProcedure, router } from '../../init'

export const llmByokQueries = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return getUserLLMByoks(ctx.user.id)
  }),
})
