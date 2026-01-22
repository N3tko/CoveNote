import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: '../domain/src/db/*.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
})
