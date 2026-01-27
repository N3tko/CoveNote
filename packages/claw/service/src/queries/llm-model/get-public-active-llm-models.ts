import { type LLMModel, llmModelTable } from '@covenote/claw-domain'
import { db } from '@covenote/claw-repository'
import { and, eq } from 'drizzle-orm'

export const getPublicActiveLLMModels = async (): Promise<LLMModel[]> => {
  return await db
    .select()
    .from(llmModelTable)
    .where(and(eq(llmModelTable.isPublic, true), eq(llmModelTable.isActive, true)))
}
