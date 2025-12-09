import {
  type AuthenticatedContext,
  type ChatMessage,
  chatMessageTable,
  chatTable,
} from '@netko/claw-domain'
import { db } from '@netko/claw-repository'
import { and, asc, eq } from 'drizzle-orm'

export const getMessagesByChatId = async (
  chatId: string,
  ctx?: AuthenticatedContext,
): Promise<ChatMessage[]> => {
  const baseQuery = db
    .select()
    .from(chatMessageTable)
    .innerJoin(chatTable, eq(chatMessageTable.chatId, chatTable.id))

  // If ctx is provided, validate chat ownership
  const where = ctx
    ? and(eq(chatMessageTable.chatId, chatId), eq(chatTable.createdBy, ctx.user.id))
    : eq(chatMessageTable.chatId, chatId)

  const rows = await baseQuery.where(where).orderBy(asc(chatMessageTable.createdAt))

  return rows.map((row) => row.chat_message)
}
