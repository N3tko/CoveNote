import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { AppSidebar } from '@/components/app-sidebar'
import { BarsSpinner } from '@/components/core/spinner/bars-spinner'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
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

  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <AppSidebar user={data.user} />
      <SidebarInset className="overflow-hidden">
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
