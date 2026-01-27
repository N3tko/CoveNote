import type { ChatMessage, ChatMessageInsert } from '@covenote/claw-domain'
import { chatMessageTable } from '@covenote/claw-domain'
import { db } from '@covenote/claw-repository'

/**
 * Save a system message (e.g., summaries) to the database
 */
export const saveSystemMessage = async (
  data: Omit<ChatMessageInsert, 'id' | 'role' | 'createdAt' | 'updatedAt'>,
): Promise<ChatMessage | undefined> => {
  const message = await db
    .insert(chatMessageTable)
    .values({
      ...data,
      role: 'system',
    })
    .returning()
    .then(([result]) => result)

  return message
}
