import openapi, { fromTypes } from '@elysiajs/openapi'
import { staticPlugin } from '@elysiajs/static'
import { AuthOpenAPI, auth } from '@netko/claw-service'
import indexHTML from '@public/index.html'
import { Elysia } from 'elysia'
import { z } from 'zod'
import { apiRouter } from './api'

const jsonSchema = (schema: z.ZodType) => z.toJSONSchema(schema, { unrepresentable: 'any' })

const app = new Elysia()
  .use(
    await staticPlugin({
      assets: 'src/public',
      prefix: '/',
      alwaysStatic: true,
    }),
  )
  // Fallback to index.html for SPA routing
  .get('*', indexHTML, { detail: { hide: true } })
  // OpenAPI
  .use(
    openapi({
      references: fromTypes(),
      path: '/docs',
      documentation: {
        info: {
          title: 'Netko API',
          description: 'API for the Netko platform',
          version: '1.0.0',
        },
        components: await AuthOpenAPI.components,
        paths: await AuthOpenAPI.getPaths(),
      },
      mapJsonSchema: {
        zod: jsonSchema,
      },
    }),
  )
  // Mount Auth endpoints
  .mount(auth.handler)
  // Mount API endpoints
  .use(apiRouter)
  // Listen on port 3000
  .listen(3000)

export type App = typeof app
