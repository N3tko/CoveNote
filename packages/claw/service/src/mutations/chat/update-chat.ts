import { type AuthenticatedContext, type Chat, chatTable } from '@netko/claw-domain'
import { db } from '@netko/claw-repository'
import { and, eq } from 'drizzle-orm'

export interface UpdateChatInput {
  title?: string
  selectedAssistant?: string | null
  selectedModel?: string | null
}

export const updateChat = async (
  chatId: string,
  updates: UpdateChatInput,
  ctx: AuthenticatedContext,
): Promise<Chat | null> => {
  const [updatedChat] = await db
    .update(chatTable)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(and(eq(chatTable.id, chatId), eq(chatTable.createdBy, ctx.user.id)))
    .returning()

  return updatedChat || null
}
