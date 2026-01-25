import { clawEnvConfig } from '@netko/claw-config'
import { Elysia, t } from 'elysia'

const SocialProviderSchema = t.Object({
  provider: t.Union([
    t.Literal('google'),
    t.Literal('github'),
    t.Literal('discord'),
    t.Literal('apple'),
  ]),
  enabled: t.Boolean(),
})

export const configRoutes = new Elysia({ prefix: '/config' }).get(
  '/social-providers',
  () => {
    const providers = clawEnvConfig.auth.socialProviders

    const enabledProviders = Object.entries(providers)
      .filter(([_, config]) => config?.enabled)
      .map(([provider]) => ({
        provider: provider as 'google' | 'github' | 'discord',
        enabled: true,
      }))

    return enabledProviders
  },
  {
    response: t.Array(SocialProviderSchema),
  },
)
