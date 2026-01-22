import { type Todo, type TodoInsert, todoTable } from '@netko/web-domain'
import { db } from '@netko/web-repository'

export const createTodo = async (data: TodoInsert): Promise<Todo | undefined> => {
  return await db
    .insert(todoTable)
    .values(data)
    .returning()
    .then(([result]) => result)
}
