'use client'

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@netko/ui/components/ai-elements/conversation'
import {
  Message,
  MessageBranch,
  MessageBranchContent,
  MessageBranchNext,
  MessageBranchPage,
  MessageBranchPrevious,
  MessageBranchSelector,
  MessageContent,
  MessageResponse,
} from '@netko/ui/components/ai-elements/message'
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@netko/ui/components/ai-elements/reasoning'
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@netko/ui/components/ai-elements/sources'
import { cn } from '@netko/ui/lib/utils'
import type { MessageType } from './definitions/message-types'

interface ChatMessagesProps {
  messages: MessageType[]
}

export const ChatMessages = ({ messages }: ChatMessagesProps) => {
  return (
    <div className="flex-1 overflow-y-auto pb-40 pt-12">
      <div className="mx-auto w-full max-w-3xl">
        <Conversation>
          <ConversationContent>
            {messages.map(({ versions, ...message }) => (
              <MessageBranch defaultBranch={0} key={message.key}>
                <MessageBranchContent>
                  {versions.map((version) => (
                    <Message from={message.from} key={`${message.key}-${version.id}`}>
                      <div
                        className={cn(
                          'space-y-2',
                          message.from === 'assistant' && 'flex flex-col items-start w-full',
                        )}
                      >
                        {message.sources?.length ? (
                          <Sources
                            className={cn(
                              message.from === 'assistant' &&
                                'w-full mx-2 rounded-lg px-3 py-2 backdrop-blur-md border border-border/50 shadow-sm',
                            )}
                            style={
                              message.from === 'assistant'
                                ? { backgroundColor: 'oklch(0.1800 0 0 / 0.7)' }
                                : undefined
                            }
                          >
                            <SourcesTrigger count={message.sources.length} />
                            <SourcesContent>
                              {message.sources.map((source) => (
                                <Source href={source.href} key={source.href} title={source.title} />
                              ))}
                            </SourcesContent>
                          </Sources>
                        ) : null}

                        {message.reasoning ? (
                          <Reasoning
                            duration={message.reasoning.duration}
                            className={cn(
                              message.from === 'assistant' &&
                                'w-full mx-2 rounded-lg px-3 py-2 backdrop-blur-md border border-border/50 shadow-sm',
                            )}
                            style={
                              message.from === 'assistant'
                                ? { backgroundColor: 'oklch(0.1800 0 0 / 0.7)' }
                                : undefined
                            }
                          >
                            <ReasoningTrigger />
                            <ReasoningContent>{message.reasoning.content}</ReasoningContent>
                          </Reasoning>
                        ) : null}

                        <MessageContent
                          className={
                            message.from === 'assistant'
                              ? 'w-full mx-2 rounded-xl px-5 py-4 text-foreground backdrop-blur-xl border border-border/40 shadow-md'
                              : 'rounded-xl px-5 py-4 backdrop-blur-xl border border-border/40 shadow-md'
                          }
                          style={{
                            backgroundColor:
                              message.from === 'assistant'
                                ? 'oklch(0.1800 0 0 / 0.8)'
                                : 'oklch(0.645 0.246 16.439 / 0.8)',
                          }}
                        >
                          <MessageResponse>{version.content}</MessageResponse>
                        </MessageContent>
                      </div>
                    </Message>
                  ))}
                </MessageBranchContent>

                {versions.length > 1 ? (
                  <MessageBranchSelector from={message.from}>
                    <MessageBranchPrevious />
                    <MessageBranchPage />
                    <MessageBranchNext />
                  </MessageBranchSelector>
                ) : null}
              </MessageBranch>
            ))}
          </ConversationContent>

          <ConversationScrollButton />
        </Conversation>
      </div>
    </div>
  )
}
