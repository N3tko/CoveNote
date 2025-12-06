import { llmByokTable } from '@netko/claw-domain'
import { db } from '@netko/claw-repository'
import { and, eq } from 'drizzle-orm'

export const deleteLLMByok = async (id: string, userId: string): Promise<void> => {
  await db.delete(llmByokTable).where(and(eq(llmByokTable.id, id), eq(llmByokTable.createdBy, userId)))
}
