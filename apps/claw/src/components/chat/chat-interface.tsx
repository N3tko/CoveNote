'use client'

import {
  IconCopy,
  IconRefresh,
  IconSparkles,
  IconThumbDown,
  IconThumbUp,
  IconWorldSearch,
} from '@tabler/icons-react'
import { useCallback, useState } from 'react'
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import {
  Message,
  MessageActions,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message'
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input'
import { CoveNoteIcon } from '@/components/core/covenote-icon'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { ChatInterfaceProps, ChatMessage } from './definitions/types'
import { mockMessages } from './definitions/values'

function ChatHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border/50 bg-background/80 px-4 backdrop-blur-sm">
      <SidebarTrigger className="-ml-1" />
      <div className="h-4 w-px bg-border/50" />
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <IconSparkles className="size-4 shrink-0 text-primary/70" />
        <h1 className="truncate font-medium text-sm">{title}</h1>
      </div>
    </header>
  )
}

function UserMessage({ message }: { message: ChatMessage }) {
  return (
    <Message from="user">
      <MessageContent>
        <div className="whitespace-pre-wrap">{message.content}</div>
      </MessageContent>
    </Message>
  )
}

function AssistantMessage({ message, isLast }: { message: ChatMessage; isLast: boolean }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [message.content])

  return (
    <Message from="assistant">
      <div className="flex gap-3">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <CoveNoteIcon className="size-4" fill="currentColor" />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <MessageContent>
            <MessageResponse>{message.content}</MessageResponse>
          </MessageContent>

          {/* Message actions */}
          <MessageActions className="mt-3 opacity-0 transition-opacity group-hover:opacity-100">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button variant="ghost" size="icon-sm" onClick={handleCopy} className="size-7">
                    <IconCopy className="size-3.5" />
                  </Button>
                }
              />
              <TooltipContent>{copied ? 'Copied!' : 'Copy'}</TooltipContent>
            </Tooltip>

            {isLast && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button variant="ghost" size="icon-sm" className="size-7">
                      <IconRefresh className="size-3.5" />
                    </Button>
                  }
                />
                <TooltipContent>Regenerate</TooltipContent>
              </Tooltip>
            )}

            <div className="mx-1 h-4 w-px bg-border/50" />

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button variant="ghost" size="icon-sm" className="size-7">
                    <IconThumbUp className="size-3.5" />
                  </Button>
                }
              />
              <TooltipContent>Good response</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button variant="ghost" size="icon-sm" className="size-7">
                    <IconThumbDown className="size-3.5" />
                  </Button>
                }
              />
              <TooltipContent>Bad response</TooltipContent>
            </Tooltip>
          </MessageActions>
        </div>
      </div>
    </Message>
  )
}

export function ChatInterface({ chatId: _chatId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)

  const handleSubmit = async (input: { text: string; files: unknown[] }) => {
    if (!input.text.trim() && input.files.length === 0) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.text,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    // Simulate AI response - replace with real AI call
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: webSearchEnabled
          ? 'This is a simulated response with web search enabled. In a real implementation, this would include search results from the web.'
          : 'This is a simulated response. In a real implementation, this would be connected to your AI backend.',
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1000)
  }

  const chatTitle = `${messages[0]?.content.slice(0, 50)}...`

  return (
    <div className="relative grid h-full grid-rows-[auto_1fr]">
      <ChatHeader title={chatTitle} />

      {/* Messages area - scrollable */}
      <Conversation className="min-h-0 overflow-hidden">
        <ConversationContent className="mx-auto max-w-3xl px-4 pb-32 pt-6">
          {messages.map((message, index) =>
            message.role === 'user' ? (
              <UserMessage key={message.id} message={message} />
            ) : (
              <AssistantMessage
                key={message.id}
                message={message}
                isLast={index === messages.length - 1}
              />
            ),
          )}

          {isLoading && (
            <Message from="assistant">
              <div className="flex gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <CoveNoteIcon className="size-4 animate-pulse" fill="currentColor" />
                </div>
                <div className="flex items-center gap-1 pt-2">
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.3s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.15s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50" />
                </div>
              </div>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Fixed input area - transparent glassy design */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/80 to-transparent px-4 pb-6 pt-16">
        <div className="pointer-events-auto mx-auto max-w-3xl">
          <PromptInput
            onSubmit={handleSubmit}
            accept="image/*,.pdf,.txt,.md"
            multiple
            className="group relative rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-black/20 backdrop-blur-2xl transition-all duration-300 hover:border-white/15 hover:bg-white/[0.07] focus-within:border-white/20 focus-within:bg-white/10"
          >
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
            <PromptInputTextarea
              placeholder="Send a message..."
              className="min-h-12 resize-none border-0 bg-transparent px-4 py-3 text-neutral-100 placeholder:text-neutral-400 focus-visible:ring-0"
            />
            <PromptInputFooter className="border-t border-white/5 px-3 py-2">
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>

                {/* Web Search Toggle */}
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant={webSearchEnabled ? 'secondary' : 'ghost'}
                        size="icon-sm"
                        onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                        className={
                          webSearchEnabled ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''
                        }
                      >
                        <IconWorldSearch className="size-4" />
                      </Button>
                    }
                  />
                  <TooltipContent>
                    {webSearchEnabled ? 'Web search enabled' : 'Enable web search'}
                  </TooltipContent>
                </Tooltip>
              </PromptInputTools>
              <PromptInputSubmit
                className="rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:from-pink-600 hover:to-violet-600"
                status={isLoading ? 'streaming' : undefined}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  )
}
