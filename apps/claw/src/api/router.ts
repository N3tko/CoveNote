import Elysia from 'elysia'
import { chatRouter, llmAssistantsRouter, llmByokRouter, llmModelsRouter, usersRouter } from './v1'

export const apiRouter = new Elysia({
  prefix: '/api',
}).group('/v1', (app) =>
  app
    .use(llmModelsRouter)
    .use(usersRouter)
    .use(llmByokRouter)
    .use(chatRouter)
    .use(llmAssistantsRouter),
)
