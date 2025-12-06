import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/core/theme/theme-provider'

/**
 * Root Layout
 *
 * The foundation of our app. Wraps everything in the providers
 * we need to make the magic happen. ✨🐱
 *
 * Note: Global CSS is loaded via index.html (bun-plugin-tailwind)
 */

// Create a stable query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

interface RootLayoutProps {
  children: React.ReactNode
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="netko-theme">
        {/* Main content */}
        {children}

        {/* Toast notifications */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: 'bg-background border-border text-foreground',
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
