import { type LLMByok, type LLMByokInsert, llmByokTable } from '@netko/claw-domain'
import { db } from '@netko/claw-repository'
import { encrypt } from '../../utils'

export const createLLMByok = async (data: LLMByokInsert): Promise<LLMByok | undefined> => {
  return await db
    .insert(llmByokTable)
    .values({
      ...data,
      encryptedKey: encrypt(data.encryptedKey),
    })
    .returning()
    .then(([result]) => result)
}
