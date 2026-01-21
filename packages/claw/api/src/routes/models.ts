import {
  createLLMModel,
  deleteLLMModel,
  getLLMModelById,
  getUserAvailableLLMModels,
  updateLLMModel,
} from '@netko/claw-service'
import { Elysia, t } from 'elysia'
import { authMacro } from '../context'

const llmProviders = ['openai', 'ollama', 'openrouter', 'custom'] as const

/**
 * Model routes
 */
export const modelRoutes = new Elysia({ prefix: '/models' })
  .use(authMacro)
  .get(
    '/',
    async ({ user }) => {
      const models = await getUserAvailableLLMModels(user.id)
      return models
    },
    {
      auth: true,
      detail: {
        summary: 'Get available models',
        description: 'Returns all public models and user-specific models',
      },
    },
  )
  .get(
    '/:id',
    async ({ params, set }) => {
      const model = await getLLMModelById(params.id)
      if (!model) {
        set.status = 404
        return { error: 'Model not found' }
      }
      return model
    },
    {
      auth: true,
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: 'Get model by ID',
      },
    },
  )
  .post(
    '/',
    async ({ body, user, set }) => {
      const model = await createLLMModel({
        ...body,
        createdBy: user.id,
      })
      if (!model) {
        set.status = 500
        return { error: 'Failed to create model' }
      }
      return model
    },
    {
      auth: true,
      body: t.Object({
        slug: t.String(),
        name: t.String(),
        provider: t.Union(llmProviders.map((p) => t.Literal(p))),
        description: t.Nullable(t.String()),
        isActive: t.Boolean(),
      }),
      detail: {
        summary: 'Create a model',
      },
    },
  )
  .patch(
    '/:id',
    async ({ params, body, user, session, set }) => {
      const model = await updateLLMModel({ id: params.id, ...body }, { user, session })
      if (!model) {
        set.status = 404
        return { error: 'Model not found or you do not have permission' }
      }
      return model
    },
    {
      auth: true,
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        slug: t.Optional(t.String()),
        name: t.Optional(t.String()),
        provider: t.Optional(t.Union(llmProviders.map((p) => t.Literal(p)))),
        description: t.Optional(t.Nullable(t.String())),
        isActive: t.Optional(t.Boolean()),
        isPublic: t.Optional(t.Boolean()),
      }),
      detail: {
        summary: 'Update a model',
      },
    },
  )
  .delete(
    '/:id',
    async ({ params, user, session, set }) => {
      try {
        await deleteLLMModel(params.id, { user, session })
        return { success: true }
      } catch {
        set.status = 404
        return { error: 'Model not found or you do not have permission' }
      }
    },
    {
      auth: true,
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: 'Delete a model',
      },
    },
  )
