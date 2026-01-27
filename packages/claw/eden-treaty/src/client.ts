import { treaty } from '@elysiajs/eden'
import type { Api } from './index'

/**
 * Create a treaty client for the API
 * @param baseUrl - The base URL of the API (defaults to empty string for same-origin)
 */
export function createTreatyClient(baseUrl = '') {
  return treaty<Api>(baseUrl)
}

export type TreatyClient = ReturnType<typeof createTreatyClient>
