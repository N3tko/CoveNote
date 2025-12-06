import { llmAssistantTable, llmModelTable } from '@netko/claw-domain'
import { sql } from 'drizzle-orm'
import { db } from './client'

/**
 * +---------------------+
 * | Seed Data           |
 * +---------------------+
 *        /\_/\
 *       ( o.o )
 */
const seed = async () => {
  try {
    const marvinPromptPath = new URL('../files/assistants/marvin.md', import.meta.url).pathname

    const marvinPrompt = await Bun.file(marvinPromptPath).text()

    const assistant = {
      id: '8d11e4bc-d38e-435d-8ec8-931656ef1e17',
      name: 'Marvin',
      description:
        'A deeply depressed hyper-intelligent AI companion assistant with a cynical and sarcastic personality.',
      systemPrompt: marvinPrompt,
      isPublic: true,
    }

    await db
      .insert(llmAssistantTable)
      .values({ ...assistant })
      .onConflictDoUpdate({
        target: [llmAssistantTable.id],
        set: {
          ...assistant,
        },
      })

    const models: (typeof llmModelTable.$inferInsert)[] = [
      {
        id: '9ade0210-5f6e-4418-9148-ac72982d8ad1',
        name: 'GPT-5 Mini',
        description:
          "GPT-5 Mini is a compact version of GPT-5, designed to handle lighter-weight reasoning tasks. It provides the same instruction-following and safety-tuning benefits as GPT-5, but with reduced latency and cost. GPT-5 Mini is the successor to OpenAI's o4-mini model.",
        provider: 'openrouter',
        slug: 'openai/gpt-5-mini',
        isActive: true,
        isPublic: true,
      },
      {
        id: 'd3ec2cce-a94b-4bfe-ba7b-171152c28a37',
        name: 'Gemini 2.5 Flash',
        description:
          "Gemini 2.5 Flash is Google's state-of-the-art workhorse model, specifically designed for advanced reasoning, coding, mathematics, and scientific tasks. It includes built-in 'thinking' capabilities, enabling it to provide responses with greater accuracy and nuanced context handling.",
        provider: 'openrouter',
        slug: 'google/gemini-2.5-flash',
        isActive: true,
        isPublic: true,
      },
    ]

    await db
      .insert(llmModelTable)
      .values(models)
      .onConflictDoUpdate({
        target: [llmModelTable.id],
        set: {
          name: sql`excluded.name`,
          description: sql`excluded.description`,
          provider: sql`excluded.provider`,
          slug: sql`excluded.slug`,
          isActive: sql`excluded.is_active`,
          isPublic: sql`excluded.is_public`,
        },
      })
  } catch (error) {
    console.error('Error creating assistant:', error)
    process.exit(1)
  } finally {
    db.$client.end()
    console.log('Database seeded successfully')
  }
}

seed()
