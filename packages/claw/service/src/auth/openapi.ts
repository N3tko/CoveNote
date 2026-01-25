/** biome-ignore-all lint/suspicious/noExplicitAny: Quick Hack */
import { auth } from './auth'

let schema: ReturnType<typeof auth.api.generateOpenAPISchema>

const getSchema = async () => {
  if (!schema) {
    schema = auth.api.generateOpenAPISchema()
  }
  return schema
}

export const AuthOpenAPI = {
  getPaths: (prefix = '/api/auth') =>
    getSchema().then(({ paths }) => {
      const reference: Record<string, unknown> = Object.create(null)

      for (const path of Object.keys(paths)) {
        const key = prefix + path
        reference[key] = paths[path]

        for (const method of Object.keys(paths[path] ?? {})) {
          const opRecord = reference[key] as Record<string, { tags: string[] }>
          if (opRecord?.[method]) {
            opRecord[method].tags = ['Authentication']
          }
        }
      }

      return reference
    }) as Promise<any>,
  components: getSchema().then(({ components }) => components) as Promise<any>,
} as const
