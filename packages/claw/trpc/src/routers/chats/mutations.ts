import { ChatInsertSchema } from '@netko/claw-domain'
import { createChat } from '@netko/claw-service'
import { protectedProcedure, router } from '../../init'

export const chatsMutations = router({
  create: protectedProcedure
    .input(ChatInsertSchema.omit({ createdBy: true }))
    .mutation(async ({ ctx, input }) => {
      return createChat({ ...input, createdBy: ctx.user.id })
    }),
})
