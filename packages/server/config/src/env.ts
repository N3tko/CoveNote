import { type ServerConfig, ServerConfigSchema } from '@netko/server-domain'

const serverConfig: ServerConfig = {
  app: {
    dev: process.env.NODE_ENV !== 'production',
    port: Number(process.env.PORT ?? 3001),
    cors: process.env.CORS?.split(',') ?? [],
  },
  db: {
    url: process.env.DATABASE_URL ?? '',
  },
  cache: {
    url: process.env.CACHE_URL ?? '',
  },
}

export const serverEnvConfig = ServerConfigSchema.parse(serverConfig)
