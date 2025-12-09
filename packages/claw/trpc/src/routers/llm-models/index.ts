import { mergeRouters } from '../../init'
import { llmModelsMutations } from './mutations'
import { llmModelsQueries } from './queries'

export const llmModelsRouter = mergeRouters(llmModelsQueries, llmModelsMutations)

