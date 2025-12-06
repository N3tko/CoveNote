import { type LLMModel, type LLMModelUpdate, llmModelTable } from '@netko/claw-domain'
import { db } from '@netko/claw-repository'
import { and, eq } from 'drizzle-orm'

export const updateLLMModel = async (data: LLMModelUpdate): Promise<LLMModel | undefined> => {
  return await db
    .update(llmModelTable)
    .set(data)
    .where(
      and(eq(llmModelTable.id, data.id ?? ''), eq(llmModelTable.createdBy, data.createdBy ?? '')),
    )
    .returning()
    .then(([result]) => result)
}
