import { type Chat, chatTable } from '@netko/claw-domain'
import type { Context } from '@netko/claw-domain/schemas/context'
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
  ctx: Context,
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


