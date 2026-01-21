import { api } from '@netko/claw-api'
import { createFileRoute } from '@tanstack/react-router'

async function handler({ request }: { request: Request }) {
  return api.handle(request)
}

export const Route = createFileRoute('/api/$')({
  server: {
    handlers: {
      GET: handler,
      POST: handler,
      PUT: handler,
      PATCH: handler,
      DELETE: handler,
      OPTIONS: handler,
    },
  },
})
