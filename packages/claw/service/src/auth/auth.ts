import { passkey } from '@better-auth/passkey'
import { clawEnvConfig } from '@netko/claw-config'
import { db } from '@netko/claw-repository'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { jwt, lastLoginMethod, magicLink, openAPI } from 'better-auth/plugins'

export const auth = betterAuth({
  appName: 'Netko',
  baseURL: clawEnvConfig.app.baseUrl,
  basePath: '/api/auth',
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  advanced: {
    cookiePrefix: 'netko',
  },
  account: {
    encryptOAuthTokens: true,
    accountLinking: {
      enabled: true,
      trustedProviders: ['google', 'github', 'discord'],
    },
  },
  plugins: [
    openAPI(),
    jwt({
      jwt: {
        expirationTime: '1d',
      },
    }),
    passkey(),
    magicLink({
      sendMagicLink: async ({ email, token, url }, _request) => {
        console.log('sendMagicLink', email, token, url)
      },
    }),
    lastLoginMethod(),
  ],
  ...clawEnvConfig.auth,
})
