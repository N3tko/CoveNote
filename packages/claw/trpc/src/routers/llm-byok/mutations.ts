import { LLMByokInsertSchema, LLMByokUpdateSchema } from '@netko/claw-domain'
import { createLLMByok, deleteLLMByok, updateLLMByok } from '@netko/claw-service'
import { z } from 'zod'
import { protectedProcedure, router } from '../../init'

export const llmByokMutations = router({
  create: protectedProcedure
    .input(LLMByokInsertSchema.omit({ createdBy: true }))
    .mutation(async ({ ctx, input }) => {
      return createLLMByok({ ...input, createdBy: ctx.user.id })
    }),

  update: protectedProcedure.input(LLMByokUpdateSchema).mutation(async ({ ctx, input }) => {
    return updateLLMByok(input, ctx)
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await deleteLLMByok(input.id, ctx)
      return { success: true }
    }),
})
