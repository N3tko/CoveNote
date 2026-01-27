import { createFileRoute } from '@tanstack/react-router'
import { ChatInterface } from '@/components/chat/chat-interface'

export const Route = createFileRoute('/_authed/chat/$chatId')({
  component: ChatPage,
})

function ChatPage() {
  const { chatId } = Route.useParams()
  return <ChatInterface chatId={chatId} />
}
