import { IconBulb, IconCode, IconFileText, IconRocket } from '@tabler/icons-react'
import type { ChatMessage, Suggestion } from './types'

// Mock messages - replace with real data fetching
export const mockMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'user',
    content: 'Can you help me understand how React Server Components work?',
  },
  {
    id: '2',
    role: 'assistant',
    content: `React Server Components (RSC) represent a fundamental shift in how we think about React applications. Let me break this down for you:

## What are Server Components?

Server Components are React components that **run exclusively on the server**. They never get shipped to the client's browser, which means:

- Zero impact on client bundle size
- Direct access to backend resources (databases, file system)
- Automatic code splitting

## Key Differences

| Feature | Server Component | Client Component |
|---------|-----------------|------------------|
| Runs on | Server only | Client (+ server for SSR) |
| Bundle size | 0 KB | Adds to bundle |
| Can use hooks | No | Yes |
| Can use browser APIs | No | Yes |

## Example

\`\`\`tsx
// This is a Server Component (default in Next.js 13+)
async function BlogPost({ id }: { id: string }) {
  // Direct database access - no API needed!
  const post = await db.posts.findUnique({ where: { id } })

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  )
}
\`\`\`

The beauty here is that the database query runs on the server, and only the rendered HTML is sent to the client.

Would you like me to dive deeper into any specific aspect?`,
  },
  {
    id: '3',
    role: 'user',
    content: 'How do I mix Server and Client Components?',
  },
  {
    id: '4',
    role: 'assistant',
    content: `Great question! Mixing Server and Client Components is one of the most powerful patterns in modern React. Here's how it works:

## The "use client" Directive

To make a component a Client Component, add \`"use client"\` at the top:

\`\`\`tsx
"use client"

import { useState } from "react"

export function LikeButton() {
  const [likes, setLikes] = useState(0)

  return (
    <button onClick={() => setLikes(l => l + 1)}>
      ❤️ {likes}
    </button>
  )
}
\`\`\`

## Composition Pattern

The key insight is that **Server Components can import Client Components**, but not vice versa:

\`\`\`tsx
// Server Component (no directive needed)
import { LikeButton } from "./LikeButton" // Client Component

async function BlogPost({ id }) {
  const post = await getPost(id)

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <LikeButton /> {/* Client island in a server sea */}
    </article>
  )
}
\`\`\`

## The Children Pattern

You can pass Server Components as children to Client Components:

\`\`\`tsx
// ClientWrapper.tsx
"use client"
export function ClientWrapper({ children }) {
  return <div className="fancy-animation">{children}</div>
}

// Page.tsx (Server Component)
import { ClientWrapper } from "./ClientWrapper"
import { ServerContent } from "./ServerContent"

export default function Page() {
  return (
    <ClientWrapper>
      <ServerContent /> {/* Still renders on server! */}
    </ClientWrapper>
  )
}
\`\`\`

This pattern is incredibly powerful for building performant applications while maintaining interactivity where needed.`,
  },
]

export const suggestions: Suggestion[] = [
  {
    icon: IconBulb,
    title: 'Brainstorm ideas',
    description: 'for a new project',
  },
  {
    icon: IconCode,
    title: 'Help me debug',
    description: 'this piece of code',
  },
  {
    icon: IconFileText,
    title: 'Summarize',
    description: 'a document or article',
  },
  {
    icon: IconRocket,
    title: 'Plan a roadmap',
    description: 'for my startup',
  },
]
