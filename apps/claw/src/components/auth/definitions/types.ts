export interface AuthUser {
  id: string
  name: string
  emailVerified: boolean
  email: string
  createdAt: Date
  updatedAt: Date
  image?: string | null
}
