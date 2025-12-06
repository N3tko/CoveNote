import { Redirect, useParams } from 'wouter'
import { ChatView } from '@/components/chat/chat-view'
import { BarsSpinner } from '@/components/core/spinner/bars-spinner'
import { useChat } from '@/hooks/api'

/**
 * Thread Page
 *
 * A specific chat conversation page.
 * Where the magic continues (or chaos ensues). 🧵💬🐱
 */

export function ThreadPage() {
  const { threadId } = useParams<{ threadId: string }>()

  const { data: thread, isLoading, isError } = useChat(threadId)

  // Show loading spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <BarsSpinner />
      </div>
    )
  }

  // Redirect to chat index if thread not found or error
  if (isError || !thread) {
    return <Redirect to="/chat" replace />
  }

  return <ChatView threadId={threadId} thread={thread} />
}

