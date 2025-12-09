import { type Chat, type ChatInsert, chatTable } from '@netko/claw-domain'
import { db } from '@netko/claw-repository'

export const createChat = async (data: ChatInsert): Promise<Chat | undefined> => {
  return await db
    .insert(chatTable)
    .values(data)
    .returning()
    .then(([result]) => result)
}
