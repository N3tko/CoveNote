import { type Chat, type ChatInsert, chatTable } from '@covenote/claw-domain'
import { db } from '@covenote/claw-repository'

export const createChat = async (data: ChatInsert): Promise<Chat | undefined> => {
  return await db
    .insert(chatTable)
    .values(data)
    .returning()
    .then(([result]) => result)
}
