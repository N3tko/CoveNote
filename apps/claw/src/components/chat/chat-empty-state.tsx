'use client'

import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
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
import { cn } from '@/lib/utils'
import { suggestions } from './definitions/values'

export function ChatEmptyState() {
  const navigate = useNavigate()
  const [hoveredSuggestion, setHoveredSuggestion] = useState<number | null>(null)

  const handleSubmit = async (message: { text: string; files: unknown[] }) => {
    if (!message.text.trim() && message.files.length === 0) return

    // In a real app, create a new chat and navigate to it
    const newChatId = Date.now().toString()
    navigate({ to: '/chat/$chatId', params: { chatId: newChatId } })
  }

  const handleSuggestionClick = (suggestion: (typeof suggestions)[0]) => {
    const text = `${suggestion.title} ${suggestion.description}`
    handleSubmit({ text, files: [] })
  }

  return (
    <div className="flex h-full flex-col">
      {/* Main content area */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 pb-32">
        {/* Logo and greeting */}
        <div className="mb-10 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-primary/5 blur-xl" />
            <CoveNoteIcon className="relative size-16" fill="currentColor" />
          </div>
          <div className="text-center">
            <h1 className="font-semibold text-2xl tracking-tight">What's on your mind?</h1>
            <p className="mt-1 text-muted-foreground text-sm">
              I'm here to help with anything you need
            </p>
          </div>
        </div>

        {/* Suggestion cards */}
        <div className="grid max-w-2xl grid-cols-2 gap-3">
          {suggestions.map((suggestion, index) => (
            <button
              type="button"
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setHoveredSuggestion(index)}
              onMouseLeave={() => setHoveredSuggestion(null)}
              className={cn(
                'group relative flex items-start gap-3 rounded-xl border border-border/50 bg-card/30 p-4 text-left transition-all duration-200',
                'hover:border-border hover:bg-card/60 hover:shadow-sm',
                hoveredSuggestion === index && 'border-border bg-card/60 shadow-sm',
              )}
            >
              <div className="rounded-lg bg-muted/50 p-2 transition-colors group-hover:bg-primary/10">
                <suggestion.icon className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-medium text-foreground text-sm">{suggestion.title}</span>
                <span className="ml-1 text-muted-foreground text-sm">{suggestion.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Input area - transparent glassy design */}
      <div className="px-4 pb-6 pt-4">
        <div className="mx-auto max-w-3xl">
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
              placeholder="Ask me anything..."
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
              </PromptInputTools>
              <PromptInputSubmit className="rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:from-pink-600 hover:to-violet-600" />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  )
}
