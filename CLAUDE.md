# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CoveNote** (`@covenote/*`) - AI-powered note-taking app built with TanStack Start, Elysia, and strict TypeScript.

## Commands

```bash
# Development
bun run dev                    # Start all (Docker + migrations + dev servers)
bun run serve                  # Dev server only (no Docker)
bun run docker:up              # Start PostgreSQL + Redis
bun run docker:down            # Stop containers

# Code Quality (run before every commit)
bun run fmt-lint               # Check with Biome
bun run fmt-lint:fix           # Auto-fix

# Build
bun run build                  # Production build
bun run check-types            # TypeScript validation

# Database
bun run db:push                # Push schema (dev)
bun run db:generate            # Generate migrations
bun run db:migrate             # Run migrations
bun run db:seed                # Seed data
```

## Architecture

```
apps/claw/                     # TanStack Start app (frontend)
  src/routes/                  # File-based routing (TanStack Router)
  src/components/              # UI components
  src/integrations/            # Eden client, auth, tanstack-query

packages/claw/
  domain/                      # Drizzle schemas + Zod entities
  repository/                  # Data access (queries)
  service/                     # Business logic
  eden-treaty/                 # Elysia API + typed client

packages/shared/               # Logger, CLI, shared configs
```

**Data Flow:** Frontend → Eden Treaty → Service → Repository → Domain

## Component Rules

### Size Limit
**Max 350 lines per component.** Split into sub-components when approaching limit.

### Organization
Group by feature with sub-components:
```
components/
  chat/
    chat-interface.tsx
    chat-empty-state.tsx
    chat-header.tsx
    definitions/
      types.ts       # Types, interfaces, props
      values.ts      # Arrays, objects, config data
      constants.ts   # String literals, magic numbers
```

### No Inline Types
**NEVER** put types/interfaces in component files. Use `definitions/types.ts`:
```typescript
// ❌ Bad - in component file
interface ChatProps { ... }

// ✅ Good - in definitions/types.ts
export interface ChatProps { ... }
```

### Hooks
- Max ~5 hooks per component
- Extract to custom hooks in `src/hooks/` when logic is reusable or complex
- Group related state into single custom hook

## Tech Stack

| Layer | Tech |
|-------|------|
| Runtime | Bun |
| Frontend | TanStack Start + Router |
| Backend | Elysia |
| API Client | Eden Treaty (`@covenote/eden-treaty/client`) |
| Database | Drizzle ORM + PostgreSQL |
| Validation | Zod |
| UI | shadcn/ui + Base UI + Tailwind v4 |
| Animation | Framer Motion |
| Auth | Better Auth |

## Code Style

**Biome** handles formatting and linting:
- 100 char line width
- Single quotes (JS), double quotes (JSX)
- Trailing commas everywhere
- camelCase functions, PascalCase components/types

**Path aliases:** `@/*` → `src/*`
```typescript
import { Button } from "@/components/ui/button"
```

## Commits

```
<emoji> <type>(<scope>): <subject>
```

| Emoji | Type | Use |
|-------|------|-----|
| ✨ | feat | New feature |
| 🐛 | fix | Bug fix |
| 📝 | docs | Documentation |
| 💄 | style | UI/styling |
| ♻️ | refactor | Code refactor |
| ⚡ | perf | Performance |
| ✅ | test | Tests |
| 🔧 | chore | Maintenance |
| 🔨 | build | Build changes |

## TypeScript

- Strict mode, zero `any`
- Unused imports/vars are errors
- Zod for all runtime validation
