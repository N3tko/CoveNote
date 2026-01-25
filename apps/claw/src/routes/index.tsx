import { createFileRoute, Navigate } from '@tanstack/react-router'
import { BarsSpinner } from '@/components/core/spinner/bars-spinner'
import { authClient } from '@/integrations/auth'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const { data, isPending } = authClient.useSession()

  if (!isPending && data?.session) {
    return <Navigate to="/chat" />
  }

  if (!isPending && !data?.session) {
    return <Navigate to="/auth" />
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <BarsSpinner />
    </div>
  )
}
