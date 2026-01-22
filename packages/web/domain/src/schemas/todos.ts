import { z } from 'zod'
import { TodoInsertSchema, TodoSchema, TodoUpdateSchema } from '../entities'

// GET /todos - List all todos
export const listTodosSchema = {
  response: {
    200: z.array(TodoSchema),
  },
}

// GET /todos/:id - Get single todo
export const getTodoSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
  response: {
    200: TodoSchema,
    404: z.object({ error: z.string() }),
  },
}

// POST /todos - Create todo
export const createTodoSchema = {
  body: TodoInsertSchema.omit({ id: true, createdAt: true, updatedAt: true }),
  response: {
    201: TodoSchema,
    400: z.object({ error: z.string() }),
  },
}

// PATCH /todos/:id - Update todo
export const updateTodoSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
  body: TodoUpdateSchema.omit({ id: true }),
  response: {
    200: TodoSchema,
    404: z.object({ error: z.string() }),
  },
}

// DELETE /todos/:id - Delete todo
export const deleteTodoSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
  response: {
    204: z.object({ success: z.boolean() }),
    404: z.object({ error: z.string() }),
  },
}
