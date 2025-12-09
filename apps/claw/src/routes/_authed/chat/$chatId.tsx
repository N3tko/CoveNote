import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Navigate } from '@tanstack/react-router'
import { ChatView } from '@/components/chat/chat-view'
import { useTRPC } from '@/integrations/trpc/react'

export const Route = createFileRoute('/_authed/chat/$chatId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { chatId } = Route.useParams()
  const trpcHttp = useTRPC()
  const {
    data: chat,
    isLoading,
    isError,
  } = useQuery(trpcHttp.chats.getById.queryOptions({ chatId: chatId as string }))

  if (isError || (!isLoading && !chat)) {
    return <Navigate to="/chat" replace />
  }

  return <ChatView chatId={chatId} chat={chat} />
}
