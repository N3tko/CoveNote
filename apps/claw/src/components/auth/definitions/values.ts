import { RiAppleFill, RiDiscordFill, RiGithubFill, RiGoogleFill } from '@remixicon/react'
import { authClient } from '@/integrations/auth'

export const SocialProviderEnum = {
  GOOGLE: 'google',
  GITHUB: 'github',
  DISCORD: 'discord',
  APPLE: 'apple',
} as const

export type SocialProvider = (typeof SocialProviderEnum)[keyof typeof SocialProviderEnum]

export const socialProviders = [
  {
    name: 'Google',
    provider: SocialProviderEnum.GOOGLE,
    icon: RiGoogleFill,
    description: 'Sign in with Google',
    action: async () => await authClient.signIn.social({ provider: SocialProviderEnum.GOOGLE }),
  },
  {
    name: 'GitHub',
    provider: SocialProviderEnum.GITHUB,
    icon: RiGithubFill,
    description: 'Sign in with GitHub',
    action: async () => await authClient.signIn.social({ provider: SocialProviderEnum.GITHUB }),
  },
  {
    name: 'Discord',
    provider: SocialProviderEnum.DISCORD,
    icon: RiDiscordFill,
    description: 'Sign in with Discord',
    action: async () => await authClient.signIn.social({ provider: SocialProviderEnum.DISCORD }),
  },
  {
    name: 'Apple',
    provider: SocialProviderEnum.APPLE,
    icon: RiAppleFill,
    description: 'Sign in with Apple',
    action: async () => await authClient.signIn.social({ provider: SocialProviderEnum.APPLE }),
  },
]
