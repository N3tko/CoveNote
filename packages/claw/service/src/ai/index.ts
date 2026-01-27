import type { ChatMessage, LLMModel } from '@covenote/claw-domain'
import { generateText, streamText } from 'ai'

export * from './status'
export * from './stream-processor'
export * from './web-search'

/**
 * AI Service using Vercel AI Gateway
 * Handles AI operations including streaming, title generation, and summarization
 *
 * Requires AI_GATEWAY_API_KEY environment variable
 * Model format: provider/model (e.g., openai/gpt-4o-mini, anthropic/claude-3-5-sonnet-latest)
 */

// Default model for system operations (title generation, summarization)
const SYSTEM_MODEL = 'openai/gpt-4o-mini'
const TOKEN_THRESHOLD = 0.75 // 75% of context window
const DEFAULT_CONTEXT_WINDOW = 8000 // Conservative default

/**
 * Get full model identifier for AI Gateway
 */
function getModelId(model: LLMModel): string {
  return `${model.provider}/${model.slug}`
}

/**
 * Stream chat completion via AI Gateway
 */
export async function* streamChatCompletion(params: {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  model: LLMModel
  systemPrompt?: string
}) {
  const { messages, model, systemPrompt } = params

  // Prepend system prompt if provided
  const allMessages = systemPrompt
    ? [{ role: 'system' as const, content: systemPrompt }, ...messages]
    : messages

  const result = await streamText({
    model: getModelId(model),
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
export async function generateTitle(params: { firstMessage: string }): Promise<string> {
  const { firstMessage } = params

  try {
    const result = await generateText({
      model: SYSTEM_MODEL,
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

    // Clean up the title
    const title = result.text.trim().replace(/^["']|["']$/g, '')

    return title || 'New Conversation'
  } catch (error) {
    console.error('Failed to generate title:', error)
    return 'New Conversation'
  }
}

/**
 * Summarize older messages when approaching token limit
 */
export async function summarizeMessages(params: { messages: ChatMessage[] }): Promise<string> {
  const { messages } = params

  // Convert messages to text format
  const conversationText = messages
    .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join('\n\n')

  try {
    const result = await generateText({
      model: SYSTEM_MODEL,
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

    return result.text.trim()
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
