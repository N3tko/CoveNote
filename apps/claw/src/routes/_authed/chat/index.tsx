import { createFileRoute } from '@tanstack/react-router'
import { ChatEmptyState } from '@/components/chat/chat-empty-state'

export const Route = createFileRoute('/_authed/chat/')({
  component: ChatIndexPage,
})

function ChatIndexPage() {
  return <ChatEmptyState />
}
