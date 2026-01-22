import { treaty } from '@elysiajs/eden'
import type { App } from 'server'

/**
 * Get the backend API base URL from Vite env
 * - VITE_BACKEND_URL: Backend server URL (default: http://localhost:3001)
 */
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3001'

/**
 * Eden Treaty client for backend API calls
 */
export const backend = treaty<App>(BACKEND_URL)

/**
 * Create a backend client with a specific base URL
 */
export function createBackendClient(baseUrl?: string) {
  return treaty<App>(baseUrl ?? BACKEND_URL)
}

export type BackendClient = ReturnType<typeof createBackendClient>
