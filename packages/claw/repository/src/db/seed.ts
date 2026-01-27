import { llmAssistantTable, llmModelTable } from '@covenote/claw-domain'
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
        name: 'GPT-4o Mini',
        description:
          "GPT-4o Mini is OpenAI's most cost-efficient small model, designed to handle lighter-weight reasoning tasks. It provides the same instruction-following and safety-tuning benefits as GPT-4o, but with reduced latency and cost.",
        provider: 'openai',
        slug: 'gpt-4o-mini',
        isActive: true,
        isPublic: true,
      },
      {
        id: 'd3ec2cce-a94b-4bfe-ba7b-171152c28a37',
        name: 'Gemini 2.0 Flash',
        description:
          "Gemini 2.0 Flash is Google's state-of-the-art workhorse model, specifically designed for advanced reasoning, coding, mathematics, and scientific tasks. It includes built-in 'thinking' capabilities, enabling it to provide responses with greater accuracy and nuanced context handling.",
        provider: 'google',
        slug: 'gemini-2.0-flash',
        isActive: true,
        isPublic: true,
      },
      {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'Claude 3.5 Sonnet',
        description:
          "Claude 3.5 Sonnet is Anthropic's most intelligent model, offering high-level performance on complex tasks. It excels at writing, analysis, coding, and math with a balanced approach to helpfulness and safety.",
        provider: 'anthropic',
        slug: 'claude-3-5-sonnet-latest',
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
