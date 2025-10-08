import { clawEnvConfig } from '@netko/claw-config'
import { prisma } from '@netko/claw-repository'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { jwt } from 'better-auth/plugins'
import { reactStartCookies } from 'better-auth/react-start'

export const auth = betterAuth({
  baseURL: clawEnvConfig.app.baseUrl,
  basePath: '/api/auth',
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  plugins: [
    jwt({
      jwt: {
        expirationTime: '1d',
      },
    }),
    reactStartCookies(),
  ],
  ...clawEnvConfig.auth,
})
