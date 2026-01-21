import { createTreatyClient, type TreatyClient } from '@netko/claw-api/client'

/**
 * Eden Treaty client for API calls
 * Uses VITE_BASE_URL or falls back to same-origin requests
 */
const baseUrl = import.meta.env.VITE_BASE_URL || ''

export const client = createTreatyClient(baseUrl)

export type Client = TreatyClient
