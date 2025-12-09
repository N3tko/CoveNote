import { type LLMModel, type LLMModelInsert, llmModelTable } from '@netko/claw-domain'
import { db } from '@netko/claw-repository'

export const createLLMModel = async (data: LLMModelInsert): Promise<LLMModel | undefined> => {
  return await db
    .insert(llmModelTable)
    .values(data)
    .returning()
    .then(([result]) => result)
}
