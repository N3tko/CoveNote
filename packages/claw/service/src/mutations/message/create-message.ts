import { type ChatMessage, type ChatMessageInsert, chatMessageTable } from '@netko/claw-domain'
import { db } from '@netko/claw-repository'

export const createMessage = async (data: ChatMessageInsert): Promise<ChatMessage | undefined> => {
  return await db
    .insert(chatMessageTable)
    .values(data)
    .returning()
    .then(([result]) => result)
}
