import type { Message, MessageInsert } from '@netko/server-domain'
import { messageTable } from '@netko/server-domain/db'
import { db } from '@netko/server-repository'

export const saveMessage = async (
  input: Pick<MessageInsert, 'username' | 'message'>,
): Promise<Message> => {
  const [message] = await db.insert(messageTable).values(input).returning()
  return message
}
