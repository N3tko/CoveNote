import { createTreatyClient } from '@netko/eden-treaty/client'

/**
 * Get the API base URL from Vite env
 * - VITE_API_URL: External API server URL
 * - Empty string: Same-origin (uses /api/* routes)
 */
const API_URL = import.meta.env.VITE_API_URL ?? ''

/**
 * Eden Treaty client for API calls
 */
export const client = createTreatyClient(API_URL)

/**
 * Create a client with a specific base URL
 */
export function createServerClient(baseUrl?: string) {
  return createTreatyClient(baseUrl ?? API_URL)
}
