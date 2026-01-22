import { createTodo, deleteTodo, getTodo, getTodos, updateTodo } from '@netko/web-service'
import { Elysia, t } from 'elysia'

export const todoRoutes = new Elysia({ prefix: '/todos' })
  .get('/', () => getTodos(), {
    response: t.Array(
      t.Object({
        id: t.String(),
        title: t.String(),
        description: t.Nullable(t.String()),
        completed: t.Boolean(),
        createdAt: t.Date(),
        updatedAt: t.Date(),
      }),
    ),
  })
  .get(
    '/:id',
    async ({ params, error }) => {
      const todo = await getTodo(params.id)
      if (!todo) {
        return error(404, { error: 'Todo not found' })
      }
      return todo
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  )
  .post(
    '/',
    async ({ body }) => {
      const todo = await createTodo(body)
      return todo
    },
    {
      body: t.Object({
        title: t.String(),
        description: t.Optional(t.String()),
        completed: t.Optional(t.Boolean()),
      }),
    },
  )
  .patch(
    '/:id',
    async ({ params, body, error }) => {
      const todo = await updateTodo(params.id, body)
      if (!todo) {
        return error(404, { error: 'Todo not found' })
      }
      return todo
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        title: t.Optional(t.String()),
        description: t.Optional(t.String()),
        completed: t.Optional(t.Boolean()),
      }),
    },
  )
  .delete(
    '/:id',
    async ({ params, error }) => {
      const todo = await deleteTodo(params.id)
      if (!todo) {
        return error(404, { error: 'Todo not found' })
      }
      return { success: true }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  )
