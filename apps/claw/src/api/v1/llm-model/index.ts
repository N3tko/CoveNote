import {
  createLLMModel,
  deleteLLMModel,
  getUserActiveLLMModels,
  getUserAvailableLLMModels,
  updateLLMModel,
} from '@netko/claw-service'
import Elysia from 'elysia'
import { authMacro } from '@/api/macros'
import {
  createLLMModelSchema,
  deleteLLMModelSchema,
  getActiveLLMModelsSchema,
  getAvailableLLMModelsSchema,
  updateLLMModelSchema,
} from './schema'

export const llmModelsRouter = new Elysia({
  prefix: '/llm-models',
  detail: {
    tags: ['LLM Models'],
  },
})
  .use(authMacro)
  .post(
    '/',
    async ({ user, body }) => {
      return await createLLMModel({ ...body, createdBy: user.id })
    },
    { ...createLLMModelSchema, auth: true },
  )
  .get('/available', async ({ user }) => await getUserAvailableLLMModels(user.id), {
    ...getAvailableLLMModelsSchema,
    auth: true,
  })
  .get('/active', async ({ user }) => await getUserActiveLLMModels(user.id), {
    ...getActiveLLMModelsSchema,
    auth: true,
  })
  .put('/:id', async ({ user, body }) => await updateLLMModel({ ...body, createdBy: user.id }), {
    ...updateLLMModelSchema,
    auth: true,
  })
  .delete('/:id', async ({ user, params }) => await deleteLLMModel(params.id, user.id), {
    ...deleteLLMModelSchema,
    auth: true,
  })
