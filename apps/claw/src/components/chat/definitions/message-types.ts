import type { FileUIPart, ToolUIPart } from 'ai'

/**
 * Simple message type for chat display
 */
export type MessageType = {
  key: string
  from: 'user' | 'assistant'
  content: string
}

/**
 * Extended message type with additional features (for future use)
 */
export type ExtendedMessageType = {
  key: string
  from: 'user' | 'assistant'
  content: string
  sources?: { href: string; title: string }[]
  reasoning?: {
    content: string
    duration: number
  }
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

