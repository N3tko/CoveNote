import { getMessagesByChatId } from '@netko/claw-service'
import { z } from 'zod'
import { protectedProcedure, router } from '../../init'

export const messagesQueries = router({
  getByChatId: protectedProcedure
    .input(z.object({ chatId: z.string() }))
    .query(async ({ ctx, input }) => {
      return getMessagesByChatId(input.chatId, ctx)
    }),
})
