import { type LLMModel, type LLMModelInsert, llmModelTable } from '@netko/claw-domain'
import { db } from '@netko/claw-repository'

export const createLLMModel = async (input: LLMModelInsert): Promise<LLMModel | undefined> => {
  return await db
    .insert(llmModelTable)
    .values(input)
    .returning()
    .then(([result]) => result)
}
