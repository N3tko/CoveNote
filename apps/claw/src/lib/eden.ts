import { treaty } from '@elysiajs/eden'
import type { App } from '@/index'

/**
 * Eden Treaty Client
 *
 * Type-safe API client for our Elysia backend.
 * Because fetch() is so 2015, and we're all about that type safety life. 🐱
 */
export const eden = treaty<App>(
  typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
)

// Re-export for convenience
export type { App }

