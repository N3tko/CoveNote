import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './src/db/drizzle',
  schema: '../domain/src/db',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
})
