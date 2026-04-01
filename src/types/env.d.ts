declare namespace NodeJS {
  interface ProcessEnv {
    // Public (client-safe)
    NEXT_PUBLIC_APP_URL: string
    NEXT_PUBLIC_APP_NAME: string

    // Server-only
    DATABASE_URL: string
    AUTH_SECRET: string

    // AI Provider Keys (server-only)
    ANTHROPIC_API_KEY?: string
    OPENAI_API_KEY?: string
    GOOGLE_GENERATIVE_AI_API_KEY?: string

    // Feature Flags
    NEXT_PUBLIC_ENABLE_ANALYTICS?: string
  }
}
