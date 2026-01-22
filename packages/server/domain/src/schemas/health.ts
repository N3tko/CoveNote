import { z } from 'zod'

// GET /health - Health check
export const healthResponseSchema = z.object({
  status: z.enum(['ok', 'error']),
  timestamp: z.number(),
  uptime: z.number(),
})
export type HealthResponse = z.infer<typeof healthResponseSchema>
