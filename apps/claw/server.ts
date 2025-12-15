/**
 * ✧･ﾟ: *✧･ﾟ:* NETKO UNIFIED SERVER *:･ﾟ✧*:･ﾟ✧
 *
 * A magical server that adapts to its environment! (◕‿◕✿)
 *
 * Development Mode:
 * - ⚡ Bun - Lightning fast JavaScript runtime
 * - 🔥 Vite - Next generation frontend tooling with HMR
 * - 🎯 TanStack Start - Modern React meta-framework
 * - 🌉 fetch-to-node - Bridges Bun's Fetch API with Node.js HTTP
 *
 * Production Mode:
 * - 🚀 Optimized static asset serving (preload + on-demand)
 * - 💾 Intelligent memory management
 * - ✨ ETag support for caching
 * - 🗜️ Gzip compression
 * - 📦 TanStack Start SSR
 *
 * Based on: https://github.com/oven-sh/bun/issues/12212
 */

import { clawEnvConfig } from '@netko/claw-config'
import { createBunServer, initializeViteServer, setupTanStackStartEnv } from './src/init/dev'
import { createProductionServer } from './src/init/prod'
import { setupDevShutdown, setupProductionShutdown } from './src/init/utils/shutdown'

/**
 * 🌟 MAIN SERVER STARTUP SEQUENCE 🌟
 * Detects environment and starts the appropriate server! ヨシ! (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧
 */
async function startServer() {
  const isDev = clawEnvConfig.app.dev

  if (isDev) {
    // 🔥 Development Mode - Vite + HMR magic! (◕‿◕✿)
    console.log('\n✨ Starting development server with Vite + HMR...\n')

    // Step 1: Configure TanStack Start environment (◕‿◕)
    setupTanStackStartEnv()

    // Step 2: Initialize Vite dev server 🔥
    const vite = await initializeViteServer()

    // Step 3: Create and start Bun server ⚡
    const server = createBunServer({ vite })

    // Step 4: Setup graceful shutdown handlers 👋
    setupDevShutdown(server, vite)
  } else {
    // 🚀 Production Mode - Optimized asset serving! (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧
    const server = await createProductionServer()

    // Setup graceful shutdown handlers 👋
    setupProductionShutdown(server)
  }
}

// ✨ Let the magic begin! ✨
startServer().catch((error) => {
  console.error('💥 Failed to start server:', error)
  process.exit(1)
})
