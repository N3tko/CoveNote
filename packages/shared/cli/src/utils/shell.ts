import * as fs from 'node:fs'
import * as path from 'node:path'
import { $ } from 'bun'

/**
 * ✧･ﾟ: *✧･ﾟ:* SHELL UTILITIES *:･ﾟ✧*:･ﾟ✧
 *
 * Bun shell helpers for running commands (◕‿◕✿)
 */

/**
 * Load environment variables from a .env file
 */
export function loadEnvFile(envFilePath: string): Record<string, string> {
  if (!fs.existsSync(envFilePath)) {
    return {}
  }

  const content = fs.readFileSync(envFilePath, 'utf-8')
  const env: Record<string, string> = {}

  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue

    const [key, ...valueParts] = trimmed.split('=')
    if (key) {
      let value = valueParts.join('=')
      // Remove surrounding quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      env[key] = value
    }
  }

  return env
}

/**
 * Run a shell command with output streaming to console
 */
export async function run(
  command: string[],
  options?: { cwd?: string; env?: Record<string, string> },
) {
  const proc = Bun.spawn(command, {
    cwd: options?.cwd,
    env: { ...process.env, ...options?.env },
    stdout: 'inherit',
    stderr: 'inherit',
    stdin: 'inherit',
  })

  const exitCode = await proc.exited
  if (exitCode !== 0) {
    throw new Error(`Command failed with exit code ${exitCode}: ${command.join(' ')}`)
  }
}

/**
 * Run a shell command and return output
 */
export async function runQuiet(command: string[], options?: { cwd?: string }) {
  const result = await $`${command}`.cwd(options?.cwd ?? process.cwd()).quiet()
  return result.text()
}

/**
 * Find process ID running on a specific port
 */
export async function findProcessOnPort(port: number): Promise<string | null> {
  try {
    // Use lsof to find process on port (works on macOS/Linux)
    const result = await $`lsof -ti :${port}`.quiet()
    const pid = result.text().trim()
    return pid || null
  } catch {
    return null
  }
}

/**
 * Kill a process by PID
 */
export async function killProcess(pid: string): Promise<boolean> {
  try {
    await $`kill -9 ${pid}`.quiet()
    return true
  } catch {
    return false
  }
}

/**
 * Kill any process running on a specific port
 */
export async function killProcessOnPort(port: number): Promise<boolean> {
  const pid = await findProcessOnPort(port)
  if (!pid) {
    return false
  }

  console.log(`⚠️  Found process (PID: ${pid}) running on port ${port}, killing it...`)
  const killed = await killProcess(pid)

  if (killed) {
    console.log('✅ Process killed successfully')
    // Wait a bit for the port to be released
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return true
  }

  console.log('❌ Failed to kill process')
  return false
}

/**
 * Get the root directory of the monorepo
 */
export function getRootDir(): string {
  // This file is at packages/shared/cli/src/utils/shell.ts
  // Go up: utils -> src -> cli -> shared -> packages -> root (5 levels)
  const thisDir = new URL('.', import.meta.url).pathname
  return path.resolve(thisDir, '..', '..', '..', '..', '..')
}

/**
 * Wait for database to be ready by attempting connections
 */
export async function waitForDatabase(
  databaseUrl: string,
  maxAttempts = 30,
  delayMs = 1000,
): Promise<boolean> {
  console.log('⏳ Waiting for database to be ready...')

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Try to connect using pg_isready or a simple connection test
      const url = new URL(databaseUrl)
      const host = url.hostname
      const port = url.port || '5432'

      // Use nc (netcat) to check if port is accepting connections
      const result = await $`nc -z ${host} ${port}`.quiet()
      if (result.exitCode === 0) {
        // Port is open, now wait a bit more for Postgres to be fully ready
        await Bun.sleep(2000)
        console.log('✅ Database is ready!')
        return true
      }
    } catch {
      // Connection failed, retry
    }

    if (attempt < maxAttempts) {
      process.stdout.write(`\r⏳ Waiting for database... (attempt ${attempt}/${maxAttempts})`)
      await Bun.sleep(delayMs)
    }
  }

  console.log('\n❌ Database failed to become ready')
  return false
}
