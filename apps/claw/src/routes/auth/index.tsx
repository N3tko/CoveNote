import { AnimatedBackground } from '@netko/ui/components/core/animated-background'
import { createFileRoute, Navigate } from '@tanstack/react-router'
import { LoginForm } from '@/components/auth/login-form'
import { authClient } from '@/integrations/auth'

export const Route = createFileRoute('/auth/')({
  component: Index,
})

function Index() {
  const { data, isPending } = authClient.useSession()
  const session = data?.session

  if (!isPending && session) {
    return <Navigate to="/chat" />
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <LoginForm />
      <AnimatedBackground />
    </div>
  )
}
