import type { FileUIPart, ToolUIPart } from 'ai'

/**
 * Message type for chat display with reasoning support
 */
export type MessageType = {
  key: string
  from: 'user' | 'assistant'
  content: string
  reasoning?: {
    content: string
    collapsed?: boolean
  }
  sources?: { href: string; title: string }[]
  tools?: {
    name: string
    description: string
    status: ToolUIPart['state']
    parameters: Record<string, unknown>
    result: string | undefined
    error: string | undefined
  }[]
}

export type ModelOption = {
  id: string
  name: string
  chef: string
  chefSlug: string
  providers: string[]
}

export type PromptInputMessage = {
  text: string
  files: FileUIPart[]
}

