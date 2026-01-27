import { type LLMModel, type LLMModelInsert, llmModelTable } from '@covenote/claw-domain'
import { db } from '@covenote/claw-repository'

export const createLLMModel = async (data: LLMModelInsert): Promise<LLMModel | undefined> => {
  return await db
    .insert(llmModelTable)
    .values(data)
    .returning()
    .then(([result]) => result)
}
