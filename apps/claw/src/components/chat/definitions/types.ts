import type { Chat as Thread } from '@netko/claw-domain'

export interface ChatViewProps {
  threadId?: string
  thread?: Thread
}
