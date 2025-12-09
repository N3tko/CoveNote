import {
  getPublicActiveLLMModels,
  getUserActiveLLMModels,
  getUserAvailableLLMModels,
} from '@netko/claw-service'
import { protectedProcedure, router } from '../../init'

export const llmModelsQueries = router({
  getActive: protectedProcedure.query(async ({ ctx }) => {
    return getUserActiveLLMModels(ctx.user.id)
  }),

  getAvailable: protectedProcedure.query(async ({ ctx }) => {
    return getUserAvailableLLMModels(ctx.user.id)
  }),

  getPublicActive: protectedProcedure.query(async () => {
    return getPublicActiveLLMModels()
  }),
})
