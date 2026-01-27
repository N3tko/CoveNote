import { api } from '@covenote/eden-treaty'
import { createFileRoute } from '@tanstack/react-router'

const handle = ({ request }: { request: Request }) => api.fetch(request)

export const Route = createFileRoute('/api/$')({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
      PUT: handle,
      DELETE: handle,
      PATCH: handle,
    },
  },
})
