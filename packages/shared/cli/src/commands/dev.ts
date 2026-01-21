import * as path from 'node:path'
import { getAppDir, getAvailableApps, parseAppArg, validateApp } from '../utils/apps'
import { killProcessOnPort, loadEnvFile, run, waitForDatabase, waitForRedis } from '../utils/shell'
import { dbGenerate, dbMigrate, dbSeed } from './db'
import { dockerUp } from './docker'

/**
 * ✧･ﾟ: *✧･ﾟ:* DEV COMMAND *:･ﾟ✧*:･ﾟ✧
 *
 * Run development server for an app (◕‿◕✿)
 */

/**
 * Run full development setup for an app:
 * 1. Start Docker containers
 * 2. Wait for database & Redis
 * 3. Generate DB schema
 * 4. Run migrations
 * 5. Seed database
 * 6. Start dev server
 */
export async function dev(args: string[]) {
  const appName = parseAppArg(args)

  if (!appName) {
    console.error('❌ Please specify an app with --app <name>')
    console.log(`Available apps: ${getAvailableApps().join(', ')}`)
    process.exit(1)
  }

  if (!validateApp(appName)) {
    console.error(`❌ App "${appName}" not found`)
    console.log(`Available apps: ${getAvailableApps().join(', ')}`)
    process.exit(1)
  }

  console.log(`🚀 Starting full development setup for ${appName}...\n`)

  // Step 1: Start Docker containers
  await dockerUp(args)

  // Step 2: Wait for database and Redis to be ready
  const appDir = getAppDir(appName)
  const envFile = path.join(appDir, '.env')
  const appEnv = loadEnvFile(envFile)
  const databaseUrl = appEnv.DATABASE_URL
  const cacheUrl = appEnv.CACHE_URL

  if (databaseUrl) {
    const isReady = await waitForDatabase(databaseUrl)
    if (!isReady) {
      console.error('❌ Database failed to start. Please check Docker logs.')
      process.exit(1)
    }
  }

  if (cacheUrl) {
    const isReady = await waitForRedis(cacheUrl)
    if (!isReady) {
      console.error('❌ Redis failed to start. Please check Docker logs.')
      process.exit(1)
    }
  }

  // Step 3: Generate DB schema
  await dbGenerate(args)

  // Step 4: Run migrations
  await dbMigrate(args)

  // Step 5: Seed the database
  await dbSeed(args)

  // Step 6: Start dev server
  await serve(args)
}

/**
 * Run only the development server for an app (without docker/db setup)
 */
export async function serve(args: string[]) {
  const appName = parseAppArg(args)

  if (!appName) {
    console.error('❌ Please specify an app with --app <name>')
    console.log(`Available apps: ${getAvailableApps().join(', ')}`)
    process.exit(1)
  }

  if (!validateApp(appName)) {
    console.error(`❌ App "${appName}" not found`)
    console.log(`Available apps: ${getAvailableApps().join(', ')}`)
    process.exit(1)
  }

  const appDir = getAppDir(appName)
  const envFile = path.join(appDir, '.env')
  const appEnv = loadEnvFile(envFile)

  // Get the port from environment or use default
  const port = Number(appEnv.PORT || process.env.PORT || 3000)

  // Check and kill any process running on the port
  console.log(`🔍 Checking if port ${port} is in use...`)
  await killProcessOnPort(port)

  console.log(`\n🖥️  Starting development server for ${appName} on port ${port}...`)

  await run(['bun', 'run', 'serve'], {
    cwd: appDir,
    env: appEnv,
  })
}
