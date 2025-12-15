# Netko Claw ✨

> The AI Side-kick That Won't Stop Talking (◕‿◕✿)

A modern React application built with TanStack Start, powered by Bun for blazing-fast performance.

## Architecture

```
apps/claw/
├── server.ts                    # Unified server (dev + prod)
├── src/
│   ├── init/
│   │   ├── dev/                 # Development server modules
│   │   │   ├── vite.ts          # Vite initialization
│   │   │   ├── server.ts        # Bun dev server
│   │   │   └── utils/
│   │   │       ├── node-bridge.ts    # Fetch ↔ Node.js bridge
│   │   │       └── env-setup.ts      # TanStack Start env setup
│   │   ├── prod/                # Production server modules
│   │   │   ├── server.ts        # Production server
│   │   │   ├── config.ts        # Production configuration
│   │   │   └── utils/
│   │   │       ├── asset-loader.ts   # Static asset loading
│   │   │       └── logger.ts         # Production logger
│   │   └── utils/
│   │       └── shutdown.ts      # Shared shutdown handlers
│   ├── routes/                  # TanStack Start routes
│   ├── components/              # React components
│   └── ...
└── vite.config.ts              # Vite configuration
```

## Features

### Development Mode 🔥
- **Vite Dev Server** - Lightning-fast HMR and module transforms
- **Bun Runtime** - Native performance with Bun.serve()
- **TanStack Start** - Modern React meta-framework with SSR
- **fetch-to-node Bridge** - Seamless integration between Bun and Vite

Based on: [Bun Issue #12212](https://github.com/oven-sh/bun/issues/12212)

### Production Mode 🚀
- **Intelligent Asset Loading** - Hybrid strategy (preload small, on-demand large)
- **Memory Optimization** - Configurable file filtering and size limits
- **Gzip Compression** - Automatic compression for eligible assets
- **ETag Support** - Efficient caching with ETag headers
- **TanStack Start SSR** - Server-side rendering for optimal performance

## Getting Started

### Prerequisites
- [Bun](https://bun.sh/) v1.0 or higher
- Node.js v22.12.0 or higher (for compatibility)

### Installation

```bash
# Install dependencies
bun install

# Setup database and environment
bun run dev:setup
```

### Development

```bash
# Start development server with HMR
bun run dev:serve

# Or run full dev flow (setup + serve)
bun run dev
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

### Production

```bash
# Build for production
bun run build

# Start production server
bun run start

# Or run full production flow (setup + start)
bun run prod:release
```

## Configuration

All configuration is managed through `@netko/claw-config` and environment variables.

### Environment Variables

Create a `.env` file in the app root (see `sample.env` for reference):

```bash
# App Configuration
PORT=3000
BASE_URL=http://localhost:3000
DEV_MODE=true

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/netko

# Auth
AUTH_SECRET=your-secret-key-here

# OAuth Providers (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Production Asset Loading

Configure asset preloading behavior with these environment variables:

```bash
# Maximum file size to preload into memory (default: 5MB)
ASSET_PRELOAD_MAX_SIZE=5242880

# Include patterns (comma-separated, optional)
ASSET_PRELOAD_INCLUDE_PATTERNS="*.js,*.css,*.woff2"

# Exclude patterns (comma-separated, optional)
ASSET_PRELOAD_EXCLUDE_PATTERNS="*.map,*.txt"

# Enable verbose logging (default: false)
ASSET_PRELOAD_VERBOSE_LOGGING=true

# Enable ETag support (default: true)
ASSET_PRELOAD_ENABLE_ETAG=true

# Enable Gzip compression (default: true)
ASSET_PRELOAD_ENABLE_GZIP=true

# Minimum size for Gzip compression (default: 1KB)
ASSET_PRELOAD_GZIP_MIN_SIZE=1024

# MIME types eligible for Gzip (comma-separated)
ASSET_PRELOAD_GZIP_MIME_TYPES="text/,application/javascript,application/json"
```

## Scripts

```bash
# Development
bun run dev              # Setup + start dev server
bun run dev:serve        # Start dev server only
bun run dev:setup        # Setup database for dev

# Production
bun run start            # Start production server
bun run build            # Build for production
bun run prod:release     # Full production flow

# Database
bun run db:generate      # Generate Prisma client
bun run db:migrate       # Run migrations (dev)
bun run db:deploy        # Deploy migrations (prod)
```

## Development Server

The development server uses a custom integration of Bun, Vite, and TanStack Start:

### How It Works

```
Request → Bun.serve() → fetch-to-node → Vite Middleware → TanStack Start
                            ↓                   ↓
                    Node.js req/res      HMR + Transforms
                            ↓                   ↓
                    Fetch Response ← SSR Handler
```

1. **Bun.serve()** receives requests as Fetch API `Request` objects
2. **fetch-to-node** converts to Node.js HTTP primitives
3. **Vite middleware** processes the request (HMR, transforms)
4. **TanStack Start** handles SSR for unhandled routes
5. Response is converted back to Fetch API `Response`

### Benefits

- ⚡ **Native Bun Performance** - Fast HTTP server
- 🔥 **Full Vite Features** - HMR, transforms, module resolution
- ⚙️ **Centralized Config** - All config from `@netko/claw-config`
- 🎯 **Type Safety** - Full TypeScript support
- 📁 **Modular Architecture** - Easy to understand and maintain
- 💬 **Kawaii Comments** - Code that's fun to read! (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧

## Production Server

The production server optimizes static asset delivery:

### Intelligent Loading Strategy

- **Small Files** (< 5MB) → Preloaded into memory with Gzip + ETag
- **Large Files** (> 5MB) → Served on-demand from disk
- **Filtered Files** → Configurable include/exclude patterns

### Performance Features

- **ETag Support** - Efficient caching with 304 responses
- **Gzip Compression** - Automatic compression for text-based assets
- **Immutable Caching** - Long-term caching for hashed assets
- **Memory Efficient** - Smart memory management for large apps

## Tech Stack

- **Runtime**: [Bun](https://bun.sh/) - Fast all-in-one JavaScript runtime
- **Framework**: [TanStack Start](https://tanstack.com/start) - Modern React meta-framework
- **Build Tool**: [Vite](https://vitejs.dev/) - Next generation frontend tooling
- **UI**: [React 19](https://react.dev/) - Latest React with concurrent features
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS
- **Type Safety**: [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- **State**: [Zustand](https://github.com/pmndrs/zustand) - Simple state management
- **Data Fetching**: [tRPC](https://trpc.io/) - End-to-end typesafe APIs
- **Auth**: [Better Auth](https://www.better-auth.com/) - Modern authentication

## Troubleshooting

### Port Already in Use

Update your `.env` file:
```bash
PORT=3001
```

### HMR Not Working

The HMR WebSocket runs on `PORT + 1`. Ensure both ports are available.

### Build Errors

```bash
# Clean and rebuild
rm -rf dist node_modules
bun install
bun run build
```

## References

- [Bun Documentation](https://bun.sh/docs)
- [TanStack Start](https://tanstack.com/start)
- [Vite Middleware Mode](https://vitejs.dev/guide/ssr.html#setting-up-the-dev-server)
- [fetch-to-node](https://www.npmjs.com/package/fetch-to-node)
- [Bun Issue #12212](https://github.com/oven-sh/bun/issues/12212)

---

Made with ❤️ and lots of (◕‿◕✿) by the Netko team

