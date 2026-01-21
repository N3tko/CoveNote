import {
  getUserLLMByoks,
  getUserByokByProvider,
  createLLMByok,
  updateLLMByok,
  deleteLLMByok,
} from '@netko/claw-service'
import { Elysia, t } from 'elysia'
import { authMacro } from '../context'

/**
 * BYOK (Bring Your Own Key) routes
 */
export const byokRoutes = new Elysia({ prefix: '/byok' })
  .use(authMacro)
  .get(
    '/',
    async ({ user }) => {
      const byoks = await getUserLLMByoks(user.id)
      // Don't expose decrypted keys in the response
      return byoks.map((byok) => ({
        id: byok.id,
        provider: byok.provider,
        isActive: byok.isActive,
        createdAt: byok.createdAt,
        updatedAt: byok.updatedAt,
      }))
    },
    {
      auth: true,
      detail: {
        summary: 'Get user BYOK configurations',
        description: 'Returns all BYOK configurations without exposing API keys',
      },
    },
  )
  .get(
    '/:provider',
    async ({ params, user, set }) => {
      const byok = await getUserByokByProvider(user.id, params.provider as 'openrouter')
      if (!byok) {
        set.status = 404
        return { error: 'BYOK not found' }
      }
      return {
        id: byok.id,
        provider: byok.provider,
        isActive: byok.isActive,
        createdAt: byok.createdAt,
        updatedAt: byok.updatedAt,
      }
    },
    {
      auth: true,
      params: t.Object({
        provider: t.String(),
      }),
      detail: {
        summary: 'Get BYOK by provider',
      },
    },
  )
  .post(
    '/',
    async ({ body, user, set }) => {
      const byok = await createLLMByok({
        ...body,
        createdBy: user.id,
      })
      if (!byok) {
        set.status = 500
        return { error: 'Failed to create BYOK' }
      }
      return {
        id: byok.id,
        provider: byok.provider,
        isActive: byok.isActive,
        createdAt: byok.createdAt,
        updatedAt: byok.updatedAt,
      }
    },
    {
      auth: true,
      body: t.Object({
        provider: t.String(),
        encryptedKey: t.String(), // Will be encrypted in the service
        isActive: t.Optional(t.Boolean()),
      }),
      detail: {
        summary: 'Create BYOK configuration',
      },
    },
  )
  .patch(
    '/:id',
    async ({ params, body, user, session, set }) => {
      const byok = await updateLLMByok(
        { id: params.id, ...body },
        { user, session },
      )
      if (!byok) {
        set.status = 404
        return { error: 'BYOK not found or unauthorized' }
      }
      return {
        id: byok.id,
        provider: byok.provider,
        isActive: byok.isActive,
        createdAt: byok.createdAt,
        updatedAt: byok.updatedAt,
      }
    },
    {
      auth: true,
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        encryptedKey: t.Optional(t.String()),
        isActive: t.Optional(t.Boolean()),
      }),
      detail: {
        summary: 'Update BYOK configuration',
      },
    },
  )
  .delete(
    '/:id',
    async ({ params, user, session }) => {
      await deleteLLMByok(params.id, { user, session })
      return { success: true }
    },
    {
      auth: true,
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: 'Delete BYOK configuration',
      },
    },
  )
