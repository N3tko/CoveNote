import { type LLMModel, llmModelTable } from '@netko/claw-domain'
import { db } from '@netko/claw-repository'
import { and, eq, or } from 'drizzle-orm'

export const getUserActiveLLMModels = async (userId: string): Promise<LLMModel[]> => {
  return await db
    .select()
    .from(llmModelTable)
    .where(
      or(
        and(eq(llmModelTable.createdBy, userId), eq(llmModelTable.isActive, true)),
        and(eq(llmModelTable.isPublic, true), eq(llmModelTable.isActive, true)),
      ),
    )
}
