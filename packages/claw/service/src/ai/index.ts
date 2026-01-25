import type { ChatMessage, LLMModel } from '@netko/claw-domain'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { streamText } from 'ai'

export * from './status'
export * from './stream-processor'

/**
 * AI Service
 * Handles AI operations including streaming, title generation, and summarization
 */

// Default model for system operations (title generation, summarization)
const SYSTEM_MODEL = 'meta-llama/llama-3.2-3b-instruct:free'
const TOKEN_THRESHOLD = 0.75 // 75% of context window
const DEFAULT_CONTEXT_WINDOW = 8000 // Conservative default

/**
 * Stream chat completion from OpenRouter
 */
export async function* streamChatCompletion(params: {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  model: LLMModel
  apiKey: string
  systemPrompt?: string
}) {
  const { messages, model, apiKey, systemPrompt } = params

  // Prepend system prompt if provided
  const allMessages = systemPrompt
    ? [{ role: 'system' as const, content: systemPrompt }, ...messages]
    : messages

  const openrouter = createOpenRouter({
    apiKey,
  })

  const result = await streamText({
    model: openrouter(model.slug),
    messages: allMessages,
  })

  // Yield text deltas as they arrive
  for await (const textPart of result.textStream) {
    yield textPart
  }
}

/**
 * Generate a concise title from the first user message
 */
export async function generateTitle(params: {
  firstMessage: string
  apiKey: string
}): Promise<string> {
  const { firstMessage, apiKey } = params

  const openrouter = createOpenRouter({
    apiKey,
  })

  try {
    const result = await streamText({
      model: openrouter(SYSTEM_MODEL),
      messages: [
        {
          role: 'system',
          content:
            "You are a title generator. Generate a concise, descriptive title (3-6 words) for a conversation based on the user's first message. Return ONLY the title, no quotes, no explanation.",
        },
        {
          role: 'user',
          content: `Generate a title for this message: "${firstMessage}"`,
        },
      ],
    })

    let title = ''
    for await (const textPart of result.textStream) {
      title += textPart
    }

    // Clean up the title
    title = title.trim().replace(/^["']|["']$/g, '')

    return title || 'New Conversation'
  } catch (error) {
    console.error('Failed to generate title:', error)
    return 'New Conversation'
  }
}

/**
 * Summarize older messages when approaching token limit
 */
export async function summarizeMessages(params: {
  messages: ChatMessage[]
  apiKey: string
}): Promise<string> {
  const { messages, apiKey } = params

  // Convert messages to text format
  const conversationText = messages
    .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join('\n\n')

  const openrouter = createOpenRouter({
    apiKey,
  })

  try {
    const result = await streamText({
      model: openrouter(SYSTEM_MODEL),
      messages: [
        {
          role: 'system',
          content:
            'You are a conversation summarizer. Create a concise summary of the conversation below, preserving key information, context, and decisions. Keep it factual and comprehensive.',
        },
        {
          role: 'user',
          content: `Summarize this conversation:\n\n${conversationText}`,
        },
      ],
    })

    let summary = ''
    for await (const textPart of result.textStream) {
      summary += textPart
    }

    return summary.trim()
  } catch (error) {
    console.error('Failed to summarize messages:', error)
    return 'Summary unavailable due to error.'
  }
}

/**
 * Count tokens in message history
 * Using a simple heuristic: ~1.3 tokens per word (common for English text with GPT models)
 */
export function getTokenCount(messages: Array<{ content: string }>): number {
  const allText = messages.map((m) => m.content).join(' ')

  // Simple token estimation: split by whitespace and multiply by 1.3
  const wordCount = allText.split(/\s+/).filter((word) => word.length > 0).length
  const estimatedTokens = Math.ceil(wordCount * 1.3)

  return estimatedTokens
}

/**
 * Check if messages need summarization based on token count
 */
export function shouldSummarize(
  messages: Array<{ content: string }>,
  contextWindow: number = DEFAULT_CONTEXT_WINDOW,
): boolean {
  const tokenCount = getTokenCount(messages)
  const threshold = contextWindow * TOKEN_THRESHOLD
  return tokenCount > threshold
}

/**
 * Get messages that should be summarized (older messages, keeping recent ones)
 */
export function getMessagesToSummarize(
  messages: ChatMessage[],
  keepRecentCount = 10,
): { toSummarize: ChatMessage[]; toKeep: ChatMessage[] } {
  if (messages.length <= keepRecentCount) {
    return { toSummarize: [], toKeep: messages }
  }

  const splitIndex = messages.length - keepRecentCount
  return {
    toSummarize: messages.slice(0, splitIndex),
    toKeep: messages.slice(splitIndex),
  }
}
