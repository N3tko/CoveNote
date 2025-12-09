import { LLMModelInsertSchema, LLMModelUpdateSchema } from '@netko/claw-domain'
import { createLLMModel, deleteLLMModel, updateLLMModel } from '@netko/claw-service'
import { z } from 'zod'
import { protectedProcedure, router } from '../../init'

export const llmModelsMutations = router({
  create: protectedProcedure
    .input(LLMModelInsertSchema.omit({ createdBy: true }))
    .mutation(async ({ input, ctx }) => {
      return createLLMModel({ ...input, createdBy: ctx.user.id })
    }),

  update: protectedProcedure.input(LLMModelUpdateSchema).mutation(async ({ input, ctx }) => {
    return updateLLMModel(input, ctx)
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await deleteLLMModel(input.id, ctx)
      return { success: true }
    }),
})
