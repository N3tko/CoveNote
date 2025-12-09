import { updateChat } from '@netko/claw-service'
import { z } from 'zod'
import { protectedProcedure, router } from '../../init'

export const chatsUpdates = router({
  /**
   * Update chat title
   */
  updateTitle: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        title: z.string().min(1).max(255),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return updateChat(input.chatId, { title: input.title }, ctx)
    }),

  /**
   * Update selected assistant for a chat
   */
  updateAssistant: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        assistantId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return updateChat(input.chatId, { selectedAssistant: input.assistantId }, ctx)
    }),

  /**
   * Update selected model for a chat
   */
  updateModel: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        modelId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return updateChat(input.chatId, { selectedModel: input.modelId }, ctx)
    }),

  /**
   * Update both assistant and model at once
   */
  updateSettings: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        assistantId: z.string().optional(),
        modelId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updates: { selectedAssistant?: string; selectedModel?: string } = {}
      if (input.assistantId) updates.selectedAssistant = input.assistantId
      if (input.modelId) updates.selectedModel = input.modelId
      return updateChat(input.chatId, updates, ctx)
    }),
})


