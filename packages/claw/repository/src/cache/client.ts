import { clawEnvConfig } from '@netko/claw-config'
import { Redis } from 'ioredis'

class RedisCacheClient {
  private static cacheInstance: Redis
  private static publisherInstance: Redis
  private static subscriberInstance: Redis

  private constructor() {}

  /**
   * Get the Redis cache instance (singleton)
   * Use this for caching operations: GET, SET, DEL, EXPIRE, etc.
   */
  public static getCache(): Redis {
    if (!RedisCacheClient.cacheInstance) {
      RedisCacheClient.cacheInstance = new Redis(clawEnvConfig.cache.url, {
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
        lazyConnect: true,
      })
    }
    return RedisCacheClient.cacheInstance
  }

  /**
   * Get the Redis publisher instance (singleton)
   * Use this for publishing messages: PUBLISH
   */
  public static getPublisher(): Redis {
    if (!RedisCacheClient.publisherInstance) {
      RedisCacheClient.publisherInstance = new Redis(clawEnvConfig.cache.url, {
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
        lazyConnect: true,
      })
    }
    return RedisCacheClient.publisherInstance
  }

  /**
   * Get the Redis subscriber instance (singleton)
   * Use this for subscribing to messages: SUBSCRIBE, PSUBSCRIBE
   */
  public static getSubscriber(): Redis {
    if (!RedisCacheClient.subscriberInstance) {
      RedisCacheClient.subscriberInstance = new Redis(clawEnvConfig.cache.url, {
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
        lazyConnect: true,
      })
    }
    return RedisCacheClient.subscriberInstance
  }

  /**
   * Gracefully close all connections
   */
  public static disconnect(): void {
    if (RedisCacheClient.cacheInstance) {
      RedisCacheClient.cacheInstance.disconnect()
    }

    if (RedisCacheClient.publisherInstance) {
      RedisCacheClient.publisherInstance.disconnect()
    }

    if (RedisCacheClient.subscriberInstance) {
      RedisCacheClient.subscriberInstance.disconnect()
    }
  }
}

// Export instances for specific use cases
export const redisCache = RedisCacheClient.getCache()
export const redisPublisher = RedisCacheClient.getPublisher()
export const redisSubscriber = RedisCacheClient.getSubscriber()

// Backwards compatibility
export const redisClient = redisCache

// Export the class for advanced usage
export { RedisCacheClient }
