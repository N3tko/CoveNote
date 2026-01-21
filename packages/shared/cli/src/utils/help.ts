/**
 * ✧･ﾟ: *✧･ﾟ:* HELP UTILITIES *:･ﾟ✧*:･ﾟ✧
 *
 * CLI help output (◕‿◕✿)
 */

export function printHelp() {
  console.log(`
✧･ﾟ: *✧･ﾟ:* NETKO CLI *:･ﾟ✧*:･ﾟ✧

Usage: bun netko <command> [options]

Docker Commands:
  docker:up --app <name>     Start Docker containers for an app (with profile)
  docker:down --app <name>   Stop Docker containers for an app

Database Commands:
  db:migrate --app <name>    Run Drizzle migrations for an app
  db:generate --app <name>   Generate Drizzle schema for an app
  db:seed --app <name>       Run seed script for an app
  db:push --app <name>       Push schema changes directly (no migration)

Development Commands:
  dev --app <name>           Full development setup (docker + db + seed + server)
  serve --app <name>         Run development server only
  build --app <name>         Build an app for production

Other:
  help, --help, -h           Show this help message

Examples:
  bun netko docker:up --app claw
  bun netko db:migrate --app claw
  bun netko dev --app claw
  bun netko serve --app claw
  bun netko build --app claw
`)
}
