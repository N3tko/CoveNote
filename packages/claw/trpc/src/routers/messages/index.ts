import { mergeRouters } from '../../init'
import { messagesMutations } from './mutations'
import { messagesQueries } from './queries'
import { messagesStreaming } from './streaming'
import { messagesSubscriptions } from './subscriptions'

export const messagesRouter = mergeRouters(
  messagesQueries,
  messagesMutations,
  messagesStreaming,
  messagesSubscriptions,
)

