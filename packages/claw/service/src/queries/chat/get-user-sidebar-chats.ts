import { type Chat, chatTable } from '@covenote/claw-domain'
import { db } from '@covenote/claw-repository'
import { desc, eq } from 'drizzle-orm'

export const getUserSidebarChats = async (userId: string): Promise<Chat[]> => {
  return await db
    .select()
    .from(chatTable)
    .where(eq(chatTable.createdBy, userId))
    .orderBy(desc(chatTable.updatedAt))
}
