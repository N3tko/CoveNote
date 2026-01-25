import { type AuthenticatedContext, llmByokTable } from '@netko/claw-domain'
import { db } from '@netko/claw-repository'
import { and, eq } from 'drizzle-orm'

export const deleteLLMByok = async (id: string, ctx?: AuthenticatedContext): Promise<void> => {
  // If ctx is provided, validate ownership
  const where = ctx
    ? and(eq(llmByokTable.id, id), eq(llmByokTable.createdBy, ctx.user.id))
    : eq(llmByokTable.id, id)

  await db.delete(llmByokTable).where(where)
}
