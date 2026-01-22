import { type Todo, todoTable } from '@netko/web-domain'
import { db } from '@netko/web-repository'
import { eq } from 'drizzle-orm'

export const deleteTodo = async (todoId: string): Promise<Todo | undefined> => {
  return await db
    .delete(todoTable)
    .where(eq(todoTable.id, todoId))
    .returning()
    .then(([result]) => result)
}
