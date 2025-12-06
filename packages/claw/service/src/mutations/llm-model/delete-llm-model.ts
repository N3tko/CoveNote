import { llmModelTable } from '@netko/claw-domain'
import { db } from '@netko/claw-repository'
import { and, eq } from 'drizzle-orm'

export const deleteLLMModel = async (id: string, userId: string): Promise<void> => {
  await db.delete(llmModelTable).where(and(eq(llmModelTable.id, id), eq(llmModelTable.createdBy, userId)))
}
