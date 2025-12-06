import { Redirect } from 'wouter'
import { BarsSpinner } from '@/components/core/spinner/bars-spinner'
import { authClient } from '@/lib/auth'

/**
 * Index Page
 *
 * The landing zone. Redirects users based on auth status.
 * Like a bouncer, but friendlier. Maybe. 🚪🐱
 */

export function IndexPage() {
  const { data, isPending } = authClient.useSession()

  // Show loading while checking session
  if (isPending) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <BarsSpinner />
      </div>
    )
  }

  // Redirect based on auth status
  if (data?.session) {
    return <Redirect to="/chat" />
  }

  return <Redirect to="/auth" />
}

