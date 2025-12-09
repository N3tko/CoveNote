import { mergeRouters } from '../../init'
import { llmByokMutations } from './mutations'
import { llmByokQueries } from './queries'

export const llmByokRouter = mergeRouters(llmByokQueries, llmByokMutations)

