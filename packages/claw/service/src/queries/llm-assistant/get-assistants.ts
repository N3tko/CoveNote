import {
  type AuthenticatedContext,
  type LLMAssistant,
  llmAssistantTable,
} from '@covenote/claw-domain'
import { db } from '@covenote/claw-repository'
import { eq, or } from 'drizzle-orm'

export const getAssistants = async (ctx?: AuthenticatedContext): Promise<LLMAssistant[]> => {
  // If ctx is provided, return public assistants and user's own
  const where = ctx
    ? or(eq(llmAssistantTable.isPublic, true), eq(llmAssistantTable.createdBy, ctx.user.id))
    : eq(llmAssistantTable.isPublic, true)

  return await db.select().from(llmAssistantTable).where(where)
}
