import { type ChatMessage, chatMessageTable, chatTable } from '@netko/claw-domain'
import { db } from '@netko/claw-repository'
import { and, asc, eq } from 'drizzle-orm'

export const getMessagesByChatId = async (
  chatId: string,
  userId: string,
): Promise<ChatMessage[]> => {
  const rows = await db
    .select()
    .from(chatMessageTable)
    .innerJoin(chatTable, eq(chatMessageTable.chatId, chatTable.id))
    .where(and(eq(chatMessageTable.chatId, chatId), eq(chatTable.createdBy, userId)))
    .orderBy(asc(chatMessageTable.createdAt))

  return rows.map((row) => row.chat_message)
}
