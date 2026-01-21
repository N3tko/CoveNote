import type { ChatMessage, ChatMessageInsert } from '@netko/claw-domain'
import { chatMessageTable } from '@netko/claw-domain'
import { db } from '@netko/claw-repository'

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
