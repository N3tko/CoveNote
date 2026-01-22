import { z } from 'zod'

export const ServerConfigSchema = z.object({
  app: z.object({
    dev: z.boolean(),
    port: z.number(),
    cors: z.array(z.string()),
  }),
  db: z.object({
    url: z.string(),
  }),
  cache: z.object({
    url: z.string(),
  }),
})

export type ServerConfig = z.infer<typeof ServerConfigSchema>
