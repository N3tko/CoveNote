import { type LLMAssistant, llmAssistantTable } from '@netko/claw-domain'
import { db } from '@netko/claw-repository'
import { eq } from 'drizzle-orm'

export const getAssistantById = async (id: string): Promise<LLMAssistant | undefined> => {
  return await db
    .select()
    .from(llmAssistantTable)
    .where(eq(llmAssistantTable.id, id))
    .then(([result]) => result)
}

