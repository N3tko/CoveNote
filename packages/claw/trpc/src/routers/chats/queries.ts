import { getChat, getUserSidebarChats, searchChats } from '@netko/claw-service'
import { z } from 'zod'
import { protectedProcedure, router } from '../../init'

export const chatsQueries = router({
  getById: protectedProcedure
    .input(z.object({ chatId: z.string() }))
    .query(async ({ ctx, input }) => {
      return getChat(input.chatId, ctx)
    }),

  getSidebar: protectedProcedure.query(async ({ ctx }) => {
    return getUserSidebarChats(ctx.user.id)
  }),

  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      return searchChats(input.query, ctx.user.id)
    }),
})
