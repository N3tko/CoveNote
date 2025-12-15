import { mergeRouters } from '../../init'
import { messagesMutations } from './mutations'
import { messagesQueries } from './queries'

export const messagesRouter = mergeRouters(messagesQueries, messagesMutations)
