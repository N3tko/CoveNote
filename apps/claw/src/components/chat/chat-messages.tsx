'use client'

import { ChevronDown, ChevronRight, Brain } from 'lucide-react'
import { useState } from 'react'
import { Loader } from '@/components/ai-elements/loader'
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message'
import { cn } from '@/lib/utils'
import type { MessageType } from './definitions/message-types'

interface ReasoningBlockProps {
  content: string
  isStreaming?: boolean
}

const ReasoningBlock = ({ content, isStreaming = false }: ReasoningBlockProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="mb-3 rounded-lg border border-border/50 bg-muted/30">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="size-4" />
        ) : (
          <ChevronRight className="size-4" />
        )}
        <Brain className="size-4" />
        <span className="font-medium">Reasoning</span>
        {isStreaming && <Loader size={12} className="ml-auto" />}
      </button>
      {isExpanded && (
        <div className="border-t border-border/50 px-3 py-2">
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-mono">
            {content}
          </pre>
        </div>
      )}
    </div>
  )
}

interface ChatMessagesProps {
  messages: MessageType[]
  isStreaming?: boolean
}

export const ChatMessages = ({ messages, isStreaming = false }: ChatMessagesProps) => {
  const lastMessage = messages[messages.length - 1]

  return (
    <>
      {messages.map(({ key, from, content, reasoning }, index) => {
        const isCurrentlyStreaming =
          isStreaming && index === messages.length - 1 && from === 'assistant'

        return (
          <Message key={key} from={from}>
            <MessageContent>
              {from === 'assistant' ? (
                <>
                  {/* Show reasoning block if present */}
                  {reasoning?.content && (
                    <ReasoningBlock
                      content={reasoning.content}
                      isStreaming={isCurrentlyStreaming && !content}
                    />
                  )}
                  {content ? (
                    <MessageResponse>{content}</MessageResponse>
                  ) : isCurrentlyStreaming ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader size={16} />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  ) : null}
                </>
              ) : (
                content
              )}
            </MessageContent>
          </Message>
        )
      })}

      {/* Show loader if streaming and last message is from user (waiting for assistant) */}
      {isStreaming && messages.length > 0 && lastMessage?.from === 'user' && (
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
