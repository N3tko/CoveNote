import { type LLMModel, llmModelTable } from '@netko/claw-domain'
import { db } from '@netko/claw-repository'
import { and, eq } from 'drizzle-orm'

export const getPublicActiveLLMModels = async (): Promise<LLMModel[]> => {
  return await db
    .select()
    .from(llmModelTable)
    .where(and(eq(llmModelTable.isPublic, true), eq(llmModelTable.isActive, true)))
}
