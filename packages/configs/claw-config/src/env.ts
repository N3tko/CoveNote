import { type ClawConfig, ClawConfigSchema } from '@netko/claw-domain'

const isEnabled = (args: (string | undefined)[]): boolean => {
  return args.every((arg) => arg !== undefined && arg !== '')
}

const clawConfig: ClawConfig = {
  app: {
    dev: process.env.DEV_MODE === 'true',
    baseUrl: process.env.BASE_URL,
    port: Number(process.env.PORT),
    cors: process.env.CORS?.split(',') ?? undefined,
    encryptionKey: process.env.ENCRYPTION_KEY,
  },
  cache: {
    url: process.env.CACHE_URL,
  },
  db: {
    url: process.env.DATABASE_URL,
  },
  auth: {
    secret: process.env.AUTH_SECRET,
    // TODO: enable email and password auth
    emailAndPassword: {
      enabled: false,
    },
    trustedOrigins: process.env.TRUSTED_ORIGINS?.split(',') ?? [],
    socialProviders: {
      // * undefined values are converted to empty strings to avoid better-auth errors
      github: {
        enabled: isEnabled([process.env.GITHUB_CLIENT_ID, process.env.GITHUB_CLIENT_SECRET]),
        clientId: process.env.GITHUB_CLIENT_ID ?? '',
        clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
      },
      google: {
        enabled: isEnabled([process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET]),
        clientId: process.env.GOOGLE_CLIENT_ID ?? '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      },
      discord: {
        enabled: isEnabled([process.env.DISCORD_CLIENT_ID, process.env.DISCORD_CLIENT_SECRET]),
        clientId: process.env.DISCORD_CLIENT_ID ?? '',
        clientSecret: process.env.DISCORD_CLIENT_SECRET ?? '',
      },
    },
  },
}

export const clawEnvConfig = ClawConfigSchema.parse(clawConfig)
