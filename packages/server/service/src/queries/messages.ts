import type { Message } from '@netko/server-domain'
import { messageTable } from '@netko/server-domain/db'
import { db } from '@netko/server-repository'
import { desc } from 'drizzle-orm'

export const getMessages = async (limit = 50): Promise<Message[]> => {
  return await db.select().from(messageTable).orderBy(desc(messageTable.createdAt)).limit(limit)
}
