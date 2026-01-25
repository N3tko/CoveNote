import type { ChatMessage, ChatMessageInsert } from '@netko/claw-domain'
import { chatMessageTable } from '@netko/claw-domain'
import { db } from '@netko/claw-repository'

/**
 * Save an assistant message to the database
 */
export const saveAssistantMessage = async (
  data: Omit<ChatMessageInsert, 'id' | 'role' | 'createdAt' | 'updatedAt'>,
): Promise<ChatMessage | undefined> => {
  const message = await db
    .insert(chatMessageTable)
    .values({
      ...data,
      role: 'assistant',
    })
    .returning()
    .then(([result]) => result)

  return message
}
