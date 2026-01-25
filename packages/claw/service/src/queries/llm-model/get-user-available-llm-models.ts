import { type LLMModel, llmModelTable } from '@netko/claw-domain'
import { db } from '@netko/claw-repository'
import { eq, or } from 'drizzle-orm'

export const getUserAvailableLLMModels = async (userId: string): Promise<LLMModel[]> => {
  return await db
    .select()
    .from(llmModelTable)
    .where(or(eq(llmModelTable.createdBy, userId), eq(llmModelTable.isPublic, true)))
}
