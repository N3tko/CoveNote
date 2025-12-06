import { type Chat, chatTable } from '@netko/claw-domain'
import { db } from '@netko/claw-repository'
import { and, eq, ilike } from 'drizzle-orm'

export const searchChats = async (userId: string, query: string): Promise<Chat[]> => {
  return await db
    .select()
    .from(chatTable)
    .where(and(eq(chatTable.createdBy, userId), ilike(chatTable.title, `%${query}%`)))
}

