import { RiAppleFill, RiDiscordFill, RiGithubFill, RiGoogleFill } from '@remixicon/react'
import { authClient } from '@/integrations/auth'

export const SocialProviderEnum = {
  GOOGLE: 'google',
  GITHUB: 'github',
  DISCORD: 'discord',
  APPLE: 'apple',
} as const

export type SocialProvider = (typeof SocialProviderEnum)[keyof typeof SocialProviderEnum]

// Animation variants
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

export const logoVariants = {
  hidden: { opacity: 0, scale: 0.8, rotate: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.6,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
}

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
