import { type Todo, todoTable } from '@netko/web-domain'
import { db } from '@netko/web-repository'

export const getTodos = async (): Promise<Todo[]> => {
  return await db.select().from(todoTable)
}
