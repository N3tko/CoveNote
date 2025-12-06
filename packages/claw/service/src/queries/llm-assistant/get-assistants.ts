import { type LLMAssistant, llmAssistantTable } from '@netko/claw-domain'
import { db } from '@netko/claw-repository'
import { eq, or } from 'drizzle-orm'

export const getAssistants = async (userId: string): Promise<LLMAssistant[]> => {
  return await db
    .select()
    .from(llmAssistantTable)
    .where(or(eq(llmAssistantTable.createdBy, userId), eq(llmAssistantTable.isPublic, true)))
    .then((results) => results.filter((a) => a.deletedAt === null))
}
