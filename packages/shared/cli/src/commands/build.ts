import * as path from 'node:path'
import { getAppDir, getAvailableApps, parseAppArg, validateApp } from '../utils/apps'
import { loadEnvFile, run } from '../utils/shell'

/**
 * ✧･ﾟ: *✧･ﾟ:* BUILD COMMAND *:･ﾟ✧*:･ﾟ✧
 *
 * Build an app for production (◕‿◕✿)
 */

type BuildType = 'vite' | 'bun'

const BUILD_COMMANDS: Record<BuildType, string[]> = {
  vite: ['bunx', '--bun', 'vite', 'build'],
  bun: ['bun', 'build', './src/index.ts', '--outdir', './dist'],
}

function parseBuildType(args: string[]): BuildType {
  const typeIndex = args.indexOf('--type')
  if (typeIndex !== -1 && args[typeIndex + 1]) {
    const type = args[typeIndex + 1] as BuildType
    if (type in BUILD_COMMANDS) {
      return type
    }
    console.warn(`⚠️ Unknown build type "${type}", defaulting to vite`)
  }
  return 'vite'
}

/**
 * Build an app for production
 * Usage: repo build --app <name> [--type <vite|next|remix|astro>]
 */
export async function build(args: string[]) {
  const appName = parseAppArg(args)
  const buildType = parseBuildType(args)

  if (!appName) {
    console.error('❌ Please specify an app with --app <name>')
    console.log(`Available apps: ${getAvailableApps().join(', ')}`)
    console.log(`Available build types: ${Object.keys(BUILD_COMMANDS).join(', ')}`)
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

  console.log(`📦 Building ${appName} for production with ${buildType}...`)

  await run(BUILD_COMMANDS[buildType], {
    cwd: appDir,
    env: { ...appEnv, NODE_ENV: 'production' },
  })

  console.log(`✅ Build for ${appName} completed!`)
}
