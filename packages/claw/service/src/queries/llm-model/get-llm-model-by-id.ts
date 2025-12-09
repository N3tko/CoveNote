import { type LLMModel, llmModelTable } from '@netko/claw-domain'
import { db } from '@netko/claw-repository'
import { eq } from 'drizzle-orm'

export const getLLMModelById = async (id: string): Promise<LLMModel | undefined> => {
  return await db
    .select()
    .from(llmModelTable)
    .where(eq(llmModelTable.id, id))
    .then(([result]) => result)
}

