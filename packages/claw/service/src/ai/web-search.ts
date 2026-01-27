import { clawEnvConfig } from '@covenote/claw-config'
import Exa from 'exa-js'

/**
 * Web Search Service using Exa
 * Provides AI-powered web search capabilities
 *
 * Requires EXA_API_KEY environment variable
 */

let exaClient: Exa | null = null

function getExaClient(): Exa {
  const apiKey = clawEnvConfig.ai.exaApiKey
  if (!apiKey) {
    throw new Error('Exa API key not configured. Please set EXA_API_KEY.')
  }

  if (!exaClient) {
    exaClient = new Exa(apiKey)
  }

  return exaClient
}

export interface WebSearchResult {
  title: string
  url: string
  snippet: string
  publishedDate?: string
  author?: string
}

export interface WebSearchOptions {
  numResults?: number
  useAutoprompt?: boolean
  type?: 'keyword' | 'neural' | 'auto'
  includeDomains?: string[]
  excludeDomains?: string[]
  startPublishedDate?: string
  endPublishedDate?: string
}

/**
 * Search the web using Exa's neural search
 */
export async function searchWeb(
  query: string,
  options: WebSearchOptions = {},
): Promise<WebSearchResult[]> {
  const exa = getExaClient()

  const {
    numResults = 5,
    useAutoprompt = true,
    type = 'auto',
    includeDomains,
    excludeDomains,
    startPublishedDate,
    endPublishedDate,
  } = options

  const result = await exa.searchAndContents(query, {
    numResults,
    useAutoprompt,
    type,
    includeDomains,
    excludeDomains,
    startPublishedDate,
    endPublishedDate,
    text: {
      maxCharacters: 500,
    },
  })

  return result.results.map((r) => ({
    title: r.title ?? 'Untitled',
    url: r.url,
    snippet: r.text ?? '',
    publishedDate: r.publishedDate ?? undefined,
    author: r.author ?? undefined,
  }))
}

/**
 * Find similar pages to a given URL
 */
export async function findSimilar(
  url: string,
  options: { numResults?: number; excludeSourceDomain?: boolean } = {},
): Promise<WebSearchResult[]> {
  const exa = getExaClient()

  const { numResults = 5, excludeSourceDomain = true } = options

  const result = await exa.findSimilarAndContents(url, {
    numResults,
    excludeSourceDomain,
    text: {
      maxCharacters: 500,
    },
  })

  return result.results.map((r) => ({
    title: r.title ?? 'Untitled',
    url: r.url,
    snippet: r.text ?? '',
    publishedDate: r.publishedDate ?? undefined,
    author: r.author ?? undefined,
  }))
}

/**
 * Get full content of a webpage
 */
export async function getPageContent(
  url: string,
): Promise<{ title: string; content: string; url: string } | null> {
  const exa = getExaClient()

  const result = await exa.getContents([url], {
    text: true,
  })

  const page = result.results[0]
  if (!page) return null

  return {
    title: page.title ?? 'Untitled',
    content: page.text ?? '',
    url: page.url,
  }
}

/**
 * Check if web search is available
 */
export function isWebSearchAvailable(): boolean {
  return Boolean(clawEnvConfig.ai?.exaApiKey)
}
