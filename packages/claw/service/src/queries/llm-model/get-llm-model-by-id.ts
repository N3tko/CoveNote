import { type LLMModel, llmModelTable } from '@covenote/claw-domain'
import { db } from '@covenote/claw-repository'
import { eq } from 'drizzle-orm'

export const getLLMModelById = async (id: string): Promise<LLMModel | undefined> => {
  return await db
    .select()
    .from(llmModelTable)
    .where(eq(llmModelTable.id, id))
    .then(([result]) => result)
}
