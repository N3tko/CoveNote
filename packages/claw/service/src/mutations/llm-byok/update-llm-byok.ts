import {
  type AuthenticatedContext,
  type LLMByok,
  type LLMByokUpdate,
  llmByokTable,
} from '@netko/claw-domain'
import { db } from '@netko/claw-repository'
import { and, eq } from 'drizzle-orm'
import { encrypt } from '../../utils'

export const updateLLMByok = async (
  data: LLMByokUpdate,
  ctx?: AuthenticatedContext,
): Promise<LLMByok | undefined> => {
  // If ctx is provided, validate ownership
  const where = ctx
    ? and(eq(llmByokTable.id, data.id), eq(llmByokTable.createdBy, ctx.user.id))
    : eq(llmByokTable.id, data.id)

  return await db
    .update(llmByokTable)
    .set({
      ...data,
      encryptedKey: data.encryptedKey ? encrypt(data.encryptedKey) : undefined,
    })
    .where(where)
    .returning()
    .then(([result]) => result)
}
