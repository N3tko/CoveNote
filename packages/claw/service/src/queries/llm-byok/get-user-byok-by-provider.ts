import { type LLMByok, type LLMProvider, llmByokTable } from '@netko/claw-domain'
import { db } from '@netko/claw-repository'
import { and, eq } from 'drizzle-orm'
import { decrypt } from '../../utils'

export const getUserByokByProvider = async (
  userId: string,
  provider: LLMProvider,
): Promise<LLMByok | undefined> => {
  const result = await db
    .select()
    .from(llmByokTable)
    .where(and(eq(llmByokTable.createdBy, userId), eq(llmByokTable.provider, provider)))
    .then(([row]) => row)

  if (!result) return undefined

  return {
    ...result,
    decryptedKey: decrypt(result.encryptedKey),
  }
}
