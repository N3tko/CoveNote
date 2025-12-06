import { Redirect } from 'wouter'
import { BarsSpinner } from '@/components/core/spinner/bars-spinner'
import { authClient } from '@/lib/auth'

/**
 * Auth Layout
 *
 * Protected route wrapper that ensures users are authenticated.
 * No ticket? No entry. Sorry not sorry. 🎫🐱
 */

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { data, isPending } = authClient.useSession()

  // Show loading spinner while checking auth
  if (isPending) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <BarsSpinner />
      </div>
    )
  }

  // Redirect to auth if not logged in
  if (!data?.session) {
    return <Redirect to="/auth" />
  }

  return <>{children}</>
}

