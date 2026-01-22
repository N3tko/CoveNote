# 🛠️ Repo CLI

A Bun-powered CLI for managing the monorepo! (◕‿◕✿)

## Installation

The CLI is automatically available when you run `bun install` at the root of the monorepo.

## Commands

### Docker Commands

```bash
# Start Docker containers for an app
bun repo docker:up --app <name>

# Stop Docker containers for an app
bun repo docker:down --app <name>
```

### Database Commands

```bash
# Run Drizzle migrations
bun repo db:migrate --app <name>

# Generate Drizzle schema
bun repo db:generate --app <name>

# Run seed script
bun repo db:seed --app <name>

# Push schema changes (no migration file)
bun repo db:push --app <name>
```

### Development Commands

```bash
# Run development server
bun repo dev --app <name>

# Build for production
bun repo build --app <name>
```

### Generator Commands

```bash
# Create a new app (TanStack or Hono)
bun repo generate:app

# Create a new shared library
bun repo generate:lib
```

### Project Rename Commands

#### Preview Rename

Preview what files would be changed when renaming the project scope:

```bash
# Using CLI directly
bun repo rename:preview @my-company

# Or using the convenience script from root
bun run rename:preview @my-company
```

This command will:
- ✅ Scan all relevant files (`.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.hbs`, `.md`, `.yml`, `.yaml`)
- ✅ Show which files contain `@netko`
- ✅ Display the number of occurrences per file
- ✅ Show total files and occurrences that would be updated
- ❌ **Will NOT modify any files** (preview only)

**Example output:**
```
🔍 Preview: Renaming from @netko to @my-company

📝 Scanning 206 files...

  📄 package.json (1 occurrence)
  📄 apps/web/package.json (8 occurrences)
  ...

╔════════════════════════════════════════════╗
║         Preview Summary 👀                 ║
╚════════════════════════════════════════════╝

📊 Would update:
   • Files: 79
   • Occurrences: 180
   • Old scope: @netko
   • New scope: @my-company
```

#### Rename Project

Rename the entire project scope from `@netko` to your organization's scope:

```bash
# Using CLI directly
bun repo rename @my-company

# Or using the convenience script from root
bun run rename @my-company
```

This command will:
- ✅ Replace all occurrences of `@netko` with your new scope
- ✅ Update all `package.json` files
- ✅ Update all imports in TypeScript/JavaScript files
- ✅ Update generator templates (`.hbs` files)
- ✅ Update configuration files
- ⚠️  **Prompt for confirmation before making changes**
- 🚫 **Skip `node_modules`, `dist`, `.git`, and `bun.lock`**

**Important:** Always preview changes first with `rename:preview` before running the actual rename!

#### Safety Guidelines

1. **Always commit your changes first:**
   ```bash
   git add .
   git commit -m "chore: save work before rename"
   ```

2. **Preview the changes:**
   ```bash
   bun run rename:preview @my-company
   ```

3. **Run the rename:**
   ```bash
   bun run rename @my-company
   ```

4. **Review the changes:**
   ```bash
   git diff
   ```

5. **Reinstall dependencies:**
   ```bash
   bun install
   ```

6. **Test your apps:**
   ```bash
   bun repo dev --app <name>
   ```

7. **Commit the rename:**
   ```bash
   git add .
   git commit -m "chore: rename project to @my-company"
   ```

#### Validation Rules

The new scope name must:
- ✅ Start with `@` (e.g., `@my-company`, not `my-company`)
- ✅ Contain only lowercase letters, numbers, and hyphens
- ✅ Match pattern: `@[a-z0-9-]+`

**Valid examples:**
- `@my-company`
- `@acme-corp`
- `@my-org123`

**Invalid examples:**
- `my-company` (missing `@`)
- `@My-Company` (uppercase letters)
- `@my_company` (underscore not allowed)
- `@my company` (spaces not allowed)

### Help

```bash
# Show help message
bun repo help
bun repo --help
bun repo -h
```

## Examples

```bash
# Start development workflow for 'web' app
bun repo docker:up --app web
bun repo db:migrate --app web
bun repo dev --app web

# Create a new app
bun repo generate:app

# Rename project (safe workflow)
bun run rename:preview @acme-corp  # Preview first
bun run rename @acme-corp          # Then rename

# Build for production
bun repo build --app web
```

## Architecture

```
packages/shared/cli/
├── src/
│   ├── commands/          # Command implementations
│   │   ├── build.ts
│   │   ├── db.ts
│   │   ├── dev.ts
│   │   ├── docker.ts
│   │   ├── generate.ts
│   │   └── rename.ts      # 🆕 Rename command
│   ├── utils/             # Shared utilities
│   │   ├── apps.ts
│   │   ├── help.ts
│   │   └── shell.ts
│   └── index.ts           # Main CLI entry point
├── package.json
└── tsconfig.json
```

## Contributing

When adding new commands:

1. Create command file in `src/commands/`
2. Export command functions
3. Import in `src/index.ts`
4. Add case in switch statement
5. Update help text in `src/utils/help.ts`
6. Update this README

## Technologies

- **Bun** - Fast JavaScript runtime
- **TypeScript** - Type safety
- **glob** - File pattern matching

