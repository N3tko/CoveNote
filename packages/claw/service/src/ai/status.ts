import { createLogger } from '@covenote/logger'
import { RedisClient } from 'bun'

const logger = createLogger('ai:status')

export type GenerationStatus = 'generating' | 'complete' | 'error' | 'unknown'

export const getGenerationStatus = async (chatId: string): Promise<GenerationStatus> => {
  const redisUrl = process.env.CACHE_URL
  if (!redisUrl) {
    logger.warn('CACHE_URL not set, cannot check generation status')
    return 'unknown'
  }

  const client = new RedisClient(redisUrl)
  await client.connect()

  try {
    const status = await client.get(`chat:${chatId}:status`)
    return (status as GenerationStatus) || 'unknown'
  } catch (error) {
    logger.error({ error, chatId }, 'Failed to get generation status')
    return 'unknown'
  } finally {
    client.close()
  }
}
