// define bun env types
declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string
    CORS: string
    DATABASE_URL: string
    CACHE_URL: string
    BASE_URL: string
    AUTH_SECRET: string
    ENCRYPTION_KEY: string
  }
}
