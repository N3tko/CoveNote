import { AnimatedBackground } from '@netko/ui/components/core/animated-background'
import { Redirect } from 'wouter'
import { LoginForm } from '@/components/auth/login-form'
import { authClient } from '@/lib/auth'

/**
 * Auth Page
 *
 * The login page with a fancy animated background.
 * Because even auth pages deserve to look good. 🎨🐱
 */

export function AuthPage() {
  const { data, isPending } = authClient.useSession()

  // If already logged in, redirect to chat
  if (!isPending && data?.session) {
    return <Redirect to="/chat" />
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <LoginForm />
      <AnimatedBackground />
    </div>
  )
}
