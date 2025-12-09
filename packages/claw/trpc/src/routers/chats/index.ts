import { mergeRouters } from '../../init'
import { chatsMutations } from './mutations'
import { chatsQueries } from './queries'
import { chatsUpdates } from './updates'

export const chatsRouter = mergeRouters(chatsQueries, chatsMutations, chatsUpdates)

