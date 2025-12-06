import { SidebarInset, SidebarProvider, SidebarTrigger } from '@netko/ui/components/shadcn/sidebar'
import { AppSidebar } from '@/components/core/nav/app-sidebar'
import { ThemeToggle } from '@/components/core/theme/theme-switcher'

/**
 * Chat Layout
 *
 * The main layout for chat pages with sidebar navigation.
 * Where conversations come to life. And occasionally die. 💬🐱
 */

interface ChatLayoutProps {
  children: React.ReactNode
}

export function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="relative flex h-[100dvh] w-screen">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-1">
          <div className="flex items-center justify-between border-b px-3 py-2 pt-[env(safe-area-inset-top)] sticky top-0 z-10 bg-background">
            <SidebarTrigger />
            <ThemeToggle />
          </div>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

