import { type Chat, chatTable } from '@netko/claw-domain'
import { db } from '@netko/claw-repository'
import { and, eq } from 'drizzle-orm'

export const getChat = async (chatId: string, userId: string): Promise<Chat | undefined> => {
  return await db
    .select()
    .from(chatTable)
    .where(and(eq(chatTable.id, chatId), eq(chatTable.createdBy, userId)))
    .then(([result]) => result)
}

