'use client'

import { Loader } from '@/components/ai-elements/loader'
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message'
import type { MessageType } from './definitions/message-types'

interface ChatMessagesProps {
  messages: MessageType[]
  isStreaming?: boolean
}

export const ChatMessages = ({ messages, isStreaming = false }: ChatMessagesProps) => {
  return (
    <>
      {messages.map(({ key, from, content }) => (
        <Message key={key} from={from}>
          <MessageContent>
            {from === 'assistant' ? (
              <MessageResponse>{content}</MessageResponse>
            ) : (
              content
            )}
          </MessageContent>
        </Message>
      ))}

      {isStreaming && messages.length > 0 && messages[messages.length - 1]?.from === 'user' && (
        <Message from="assistant">
          <MessageContent>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader size={16} />
              <span className="text-sm">Thinking...</span>
            </div>
          </MessageContent>
        </Message>
      )}
    </>
  )
}
