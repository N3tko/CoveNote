import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { BarsSpinner } from '@/components/core/spinner/bars-spinner'
import { authClient } from '@/integrations/auth'

export const Route = createFileRoute('/_authed')({
  component: ProtectedRouteLayout,
})

function ProtectedRouteLayout() {
  const { data, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <BarsSpinner />
      </div>
    )
  }

  if (!data?.session) {
    return <Navigate to="/auth" />
  }

  return <Outlet />
}
