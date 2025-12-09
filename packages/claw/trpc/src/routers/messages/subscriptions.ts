import { createLogger } from '@netko/logger'
import { z } from 'zod'
import { type ChatEventPayload, chatEvents, getChatChannel } from '../../events'
import { protectedProcedure, router } from '../../init'

const logger = createLogger('subscriptions')

/**
 * Create an async iterator from EventEmitter events
 * This allows us to use the EventEmitter with tRPC subscriptions
 */
function createEventIterator(channel: string): AsyncIterableIterator<ChatEventPayload> {
  const queue: ChatEventPayload[] = []
  let resolver: ((value: IteratorResult<ChatEventPayload>) => void) | null = null
  let done = false

  const handler = (event: ChatEventPayload) => {
    if (resolver) {
      resolver({ value: event, done: false })
      resolver = null
    } else {
      queue.push(event)
    }
  }

  chatEvents.on(channel, handler)

  return {
    [Symbol.asyncIterator]() {
      return this
    },
    async next(): Promise<IteratorResult<ChatEventPayload>> {
      if (done) {
        return { value: undefined, done: true }
      }

      if (queue.length > 0) {
        const event = queue.shift()!
        return { value: event, done: false }
      }

      return new Promise((resolve) => {
        resolver = resolve
      })
    },
    async return(): Promise<IteratorResult<ChatEventPayload>> {
      done = true
      chatEvents.off(channel, handler)
      logger.debug({ channel }, 'subscription cleanup')
      return { value: undefined, done: true }
    },
    async throw(error: Error): Promise<IteratorResult<ChatEventPayload>> {
      done = true
      chatEvents.off(channel, handler)
      logger.error({ channel, err: error.message }, 'subscription error')
      throw error
    },
  }
}

export const messagesSubscriptions = router({
  /**
   * Subscribe to chat message events
   * Uses in-memory EventEmitter for real-time updates
   */
  onChatMessage: protectedProcedure
    .input(z.object({ chatId: z.string() }))
    .subscription(async function* (opts) {
      const { chatId } = opts.input
      const { user } = opts.ctx
      const channel = getChatChannel(chatId, user.id)

      logger.info({ chatId, userId: user.id }, 'subscription started')

      try {
        const iterator = createEventIterator(channel)

        for await (const event of iterator) {
          logger.debug({ chatId, type: event.type }, 'yielding event')
          yield { data: event }
        }
      } catch (error) {
        logger.error(
          {
            chatId,
            userId: user.id,
            err: error instanceof Error ? error.message : String(error),
          },
          'subscription failed',
        )
        throw error
      } finally {
        logger.info({ chatId, userId: user.id }, 'subscription ended')
      }
    }),
})
