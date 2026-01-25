import {
  type AuthenticatedContext,
  type LLMModel,
  type LLMModelUpdate,
  llmModelTable,
} from '@netko/claw-domain'
import { db } from '@netko/claw-repository'
import { and, eq } from 'drizzle-orm'

export const updateLLMModel = async (
  data: LLMModelUpdate,
  ctx?: AuthenticatedContext,
): Promise<LLMModel | undefined> => {
  // If ctx is provided, validate ownership
  const where = ctx
    ? and(eq(llmModelTable.id, data.id), eq(llmModelTable.createdBy, ctx.user.id))
    : eq(llmModelTable.id, data.id)

  return await db
    .update(llmModelTable)
    .set(data)
    .where(where)
    .returning()
    .then(([result]) => result)
}
