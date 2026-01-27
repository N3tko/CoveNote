# ☕ TanStack + Elysia Monorepo Template


A monorepo template for building full-stack TypeScript applications. No `any` types were harmed in the making of this template.

## 🐱 Tech Stack

| Layer | Tech | Notes |
|-------|------|-------|
| **Runtime** | [Bun](https://bun.sh/) | 69% quicker than Node. Nice. |
| **Monorepo** | [Turborepo](https://turbo.build/) | Caches builds like I cache coffee cups on my desk |
| **Frontend** | [TanStack Start](https://tanstack.com/start) | SSR framework. Tuturu~ |
| **Backend** | [Elysia](https://elysiajs.com/) | Express but speedy. Like, really speedy |
| **API Client** | [Eden Treaty](https://elysiajs.com/eden/treaty) | End-to-end types. The choice of Steins;Gate |
| **Database** | [Drizzle ORM](https://orm.drizzle.team/) | SQL that actually sparks joy |
| **UI** | [shadcn/ui](https://ui.shadcn.com/) | Beautiful components. Copy-paste no jutsu |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | 69 utility classes and counting |
| **Auth** | [Better Auth](https://www.better-auth.com/) | Authentication that just works |
| **Validation** | [Zod](https://zod.dev/) | Runtime checks. Trust no one, not even your inputs |
| **Linting** | [Biome](https://biomejs.dev/) | Quicker than ESLint. Quicker than Prettier. Why not both? |

## 📁 Project Structure

```
.
├── apps/
│   ├── web/                    # Frontend (where 🐱 live)
│   └── server/                 # Backend (where 🐱 sleep)
├── packages/
│   ├── configs/                # Env configs (the secret lab)
│   ├── shared/                 # Shared stuff
│   │   ├── cli/                # CLI tool (like a microwave, but for code)
│   │   ├── logger/             # console.log's final form
│   │   ├── elysia-logger/      # HTTP logging middleware
│   │   └── typescript-config/  # tsconfig presets
│   ├── web/                    # Web packages
│   │   ├── domain/             # DB schema + entities
│   │   ├── repository/         # Database layer
│   │   ├── service/            # Business logic
│   │   └── eden-treaty/        # API routes + client
│   └── server/                 # Server packages
├── turbo/
│   └── generators/             # Scaffolding templates
└── compose.yml                 # Docker config
```

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0
- [Docker](https://www.docker.com/)
- ☕ Coffee

### Setup (Time: 6 + 9 minutes)

```bash
# Clone
git clone <repo-url> my-project && cd my-project

# Install (good time to grab another ☕)
bun install

# Rename project (optional)
bun run rename my-cool-project

# Setup env
cp apps/web/sample.env apps/web/.env
cp apps/server/sample.env apps/server/.env

# Summon the databases
cd apps/web && bun run docker:up
cd apps/server && bun run docker:up

# Push schemas
bun run db:push

# Launch
bun run dev
```

Web: `http://localhost:3000` | Backend: `http://localhost:3001`

## 📜 Scripts

### Root

| Script | What |
|--------|------|
| `bun run dev` | Start all apps |
| `bun run build` | Build everything |
| `bun run fmt-lint` | Check code style |
| `bun run fmt-lint:fix` | Fix code style |
| `bun run check-types` | TypeScript check |
| `bun run rename <name>` | Rename project |

### Per App

| Script | What |
|--------|------|
| `bun run dev` | Docker + migrations + dev server |
| `bun run serve` | Dev server only |
| `bun run build` | Production build |
| `bun run docker:up` | Start containers |
| `bun run docker:down` | Stop containers |
| `bun run db:migrate` | Run migrations |
| `bun run db:generate` | Generate migrations |
| `bun run db:push` | Push schema to DB |
| `bun run db:seed` | Seed database |

## 🏗️ Generators

### New App

```bash
bunx turbo gen app
```

Options:
- **TanStack Start** — Full-stack with Eden Treaty
- **Elysia Server** — Standalone API server

Creates:
```
apps/{name}/
packages/{name}/domain/
packages/{name}/repository/
packages/{name}/service/
packages/{name}/eden-treaty/  # TanStack only
packages/configs/{name}-config/
```

### New Library

```bash
bunx turbo gen lib
```

## 🏛️ Architecture

```
┌─────────────────────────────────┐
│              App                │  ← 🐱 live here
├─────────────────────────────────┤
│          Eden Treaty            │  ← Type-safe API
├─────────────────────────────────┤
│            Service              │  ← Business logic
├─────────────────────────────────┤
│          Repository             │  ← DB queries
├─────────────────────────────────┤
│            Domain               │  ← Schemas
├─────────────────────────────────┤
│            Config               │  ← Env vars
└─────────────────────────────────┘
```

## 🔌 Eden Treaty

```typescript
import { client } from '@/integrations/eden'

// Fully typed. The Organization cannot intercept these types.
const { data, error } = await client.api.todos.get()
//     ^? Todo[]

import { backend } from '@/integrations/backend'

const { data } = await backend.health.get()
//     ^? { status: 'ok' | 'error', timestamp: number, uptime: number }
```

Change the API → TypeScript errors everywhere. As intended.

## 🔐 Environment Variables

### Web (`apps/web/.env`)

| Variable | Description |
|----------|-------------|
| `BASE_URL` | App URL |
| `VITE_API_URL` | Same-origin API |
| `VITE_BACKEND_URL` | Backend server URL |
| `DATABASE_URL` | PostgreSQL |
| `CACHE_URL` | Redis |
| `AUTH_SECRET` | Auth secret |
| `ENCRYPTION_KEY` | Encryption key |

### Server (`apps/server/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port |
| `CORS` | Allowed origins |
| `DATABASE_URL` | PostgreSQL |
| `CACHE_URL` | Redis |

## 🪝 Git Hooks

Pre-commit runs `bun run fmt-lint`. No ugly code allowed.

