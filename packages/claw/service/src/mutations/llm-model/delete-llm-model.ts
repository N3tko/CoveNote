import { type AuthenticatedContext, llmModelTable } from '@covenote/claw-domain'
import { db } from '@covenote/claw-repository'
import { and, eq } from 'drizzle-orm'

export const deleteLLMModel = async (id: string, ctx?: AuthenticatedContext): Promise<void> => {
  // If ctx is provided, validate ownership
  const where = ctx
    ? and(eq(llmModelTable.id, id), eq(llmModelTable.createdBy, ctx.user.id))
    : eq(llmModelTable.id, id)

  await db.delete(llmModelTable).where(where)
}
