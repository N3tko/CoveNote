import { createLLMByok, deleteLLMByok, getUserLLMByoks, updateLLMByok } from '@netko/claw-service'
import Elysia from 'elysia'
import { authMacro } from '@/api/macros'
import {
  createLLMByokSchema,
  deleteLLMByokSchema,
  getUserLLMByoksSchema,
  updateLLMByokSchema,
} from './schema'

export const llmByokRouter = new Elysia({
  prefix: '/llm-byok',
  detail: {
    tags: ['LLM BYOK'],
  },
})
  .use(authMacro)
  .post('/', async ({ user, body }) => await createLLMByok({ ...body, createdBy: user.id }), {
    ...createLLMByokSchema,
    auth: true,
  })
  .get('/', async ({ user }) => await getUserLLMByoks(user.id), {
    ...getUserLLMByoksSchema,
    auth: true,
  })
  .put('/:id', async ({ user, body, params }) => await updateLLMByok(params.id, body, user.id), {
    ...updateLLMByokSchema,
    auth: true,
  })
  .delete('/:id', async ({ user, params }) => await deleteLLMByok(params.id, user.id), {
    ...deleteLLMByokSchema,
    auth: true,
  })
