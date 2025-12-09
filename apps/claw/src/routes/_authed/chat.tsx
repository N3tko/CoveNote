import { SidebarInset, SidebarProvider } from '@netko/ui/components/shadcn/sidebar'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AppSidebar } from '@/components/core/nav/app-sidebar'

export const Route = createFileRoute('/_authed/chat')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="relative flex h-[100dvh] w-screen">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-1">
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
