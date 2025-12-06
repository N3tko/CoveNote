import { treaty } from '@elysiajs/eden'
import type { App } from '.'

export const edenClient = treaty<App>('http://localhost:3000')
