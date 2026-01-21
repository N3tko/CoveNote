import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Navigate } from '@tanstack/react-router'
import { ChatView } from '@/components/chat/chat-view'
import { client } from '@/integrations/eden'

export const Route = createFileRoute('/_authed/chat/$chatId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { chatId } = Route.useParams()

  const {
    data: chat,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['chats', chatId],
    queryFn: async () => {
      const response = await client.api.chats[chatId].get()
      if (response.error) throw new Error('Chat not found')
      return response.data
    },
  })

  if (isError || (!isLoading && !chat)) {
    return <Navigate to="/chat" replace />
  }

  return <ChatView chatId={chatId} chat={chat} />
}
