import { createLogger } from '@netko/logger'
import { z } from 'zod'
import { protectedProcedure, router } from '../../init'

const logger = createLogger('streaming')

export const messagesStreaming = router({
  /**
   * Cancel an ongoing streaming message
   * This can be used to stop AI generation mid-stream
   */
  cancelStreaming: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        messageId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      logger.info({ chatId: input.chatId, messageId: input.messageId }, 'cancelling streaming')

      // TODO: Implement actual cancellation logic
      // This would require storing active streaming sessions
      // and providing a way to abort them

      return { success: true, messageId: input.messageId }
    }),

  /**
   * Regenerate a message
   * This will create a new version of the assistant's response
   */
  regenerate: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        messageId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      logger.info(
        { chatId: input.chatId, messageId: input.messageId },
        'regenerating message',
      )

      // TODO: Implement regeneration logic
      // This would:
      // 1. Get the message context (previous messages)
      // 2. Trigger AI generation again
      // 3. Create a new message version

      return { success: true, messageId: input.messageId }
    }),
})


