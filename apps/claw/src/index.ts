import openapi, { fromTypes } from '@elysiajs/openapi'
import { staticPlugin } from '@elysiajs/static'
import { AuthOpenAPI, auth } from '@netko/claw-service'
import indexHTML from '@public/index.html'
import { Elysia } from 'elysia'
import { z } from 'zod'
import { apiRouter } from './api'

const jsonSchema = (schema: z.ZodType) => z.toJSONSchema(schema, { unrepresentable: 'any' })

const app = new Elysia({
  serve: {
    routes: {
      '/api/*': false,
      // Mount Auth endpoints
      '/api/auth/*': auth.handler,
    },
  },
})
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
  // Mount API endpoints
  .use(apiRouter)
  // Serve static assets
  .use(
    await staticPlugin({
      assets: 'src/public',
      prefix: '/',
      alwaysStatic: true,
    }),
  )
  .get('/*', indexHTML, {
    detail: { hide: true },
  })
  // Listen on port 3000
  .listen(3000)

export type App = typeof app
