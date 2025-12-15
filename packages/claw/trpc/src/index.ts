import { router } from './init'
import { assistantsRouter } from './routers/assistants'
import { authRouter } from './routers/auth'
import { chatsRouter } from './routers/chats'
import { llmByokRouter } from './routers/llm-byok'
import { llmModelsRouter } from './routers/llm-models'
import { messagesRouter } from './routers/messages'

export const appRouter = router({
  auth: authRouter,
  chats: chatsRouter,
  messages: messagesRouter,
  assistants: assistantsRouter,
  llmModels: llmModelsRouter,
  llmByok: llmByokRouter,
})

export type AppRouter = typeof appRouter

// Re-export init utilities for use in the app
export { createContext, mergeRouters, protectedProcedure, publicProcedure, router } from './init'
