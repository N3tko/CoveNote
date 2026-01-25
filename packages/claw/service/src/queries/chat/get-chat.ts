import { type AuthenticatedContext, type Chat, chatTable } from '@netko/claw-domain'
import { db } from '@netko/claw-repository'
import { and, eq } from 'drizzle-orm'

export const getChat = async (
  chatId: string,
  ctx?: AuthenticatedContext,
): Promise<Chat | undefined> => {
  // If ctx is provided, filter by user ownership
  const where = ctx
    ? and(eq(chatTable.id, chatId), eq(chatTable.createdBy, ctx.user.id))
    : eq(chatTable.id, chatId)

  return await db
    .select()
    .from(chatTable)
    .where(where)
    .then(([result]) => result)
}
