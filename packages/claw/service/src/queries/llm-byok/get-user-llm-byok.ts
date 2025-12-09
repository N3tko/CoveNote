import { type LLMByok, llmByokTable } from '@netko/claw-domain'
import { db } from '@netko/claw-repository'
import { eq } from 'drizzle-orm'
import { decrypt } from '../../utils'

export const getUserLLMByoks = async (userId: string): Promise<LLMByok[]> => {
  return db
    .select()
    .from(llmByokTable)
    .where(eq(llmByokTable.createdBy, userId))
    .then((result) =>
      result.map((item) => ({
        ...item,
        decryptedKey: decrypt(item.encryptedKey),
      })),
    )
}
