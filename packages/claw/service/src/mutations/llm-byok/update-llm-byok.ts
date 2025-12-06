import { type LLMByok, type LLMByokUpdate, llmByokTable } from '@netko/claw-domain'
import { db } from '@netko/claw-repository'
import { and, eq } from 'drizzle-orm'
import { encrypt } from '../../utils'

export const updateLLMByok = async (
  id: string,
  data: LLMByokUpdate,
  userId?: string,
): Promise<LLMByok | undefined> => {
  const where = userId
    ? and(eq(llmByokTable.id, id), eq(llmByokTable.createdBy, userId))
    : eq(llmByokTable.id, id)
  return await db
    .update(llmByokTable)
    .set({
      ...data,
      encryptedKey: data.encryptedKey ? encrypt(data.encryptedKey) : undefined,
    })
    .where(where)
    .returning()
    .then(([_result]) => _result)
}
