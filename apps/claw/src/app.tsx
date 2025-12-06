import { createRoot } from 'react-dom/client'
import { Route, Switch } from 'wouter'
import { AuthLayout, ChatLayout, RootLayout } from '@/layouts'
import { AuthPage, ChatIndexPage, IndexPage, SettingsPage, ThreadPage } from '@/pages'

/**
 * Chad Chat App 🐱
 *
 * The main application component with wouter routing.
 * Where dreams come to chat and cats come to judge.
 */

function App() {
  return (
    <RootLayout>
      <Switch>
        {/* Public routes */}
        <Route path="/" component={IndexPage} />
        <Route path="/auth" component={AuthPage} />

        {/* Protected chat routes */}
        <Route path="/chat">
          <AuthLayout>
            <ChatLayout>
              <ChatIndexPage />
            </ChatLayout>
          </AuthLayout>
        </Route>

        <Route path="/chat/:threadId">
          <AuthLayout>
            <ChatLayout>
              <ThreadPage />
            </ChatLayout>
          </AuthLayout>
        </Route>

        {/* Protected settings route */}
        <Route path="/settings">
          <AuthLayout>
            <ChatLayout>
              <SettingsPage />
            </ChatLayout>
          </AuthLayout>
        </Route>

        {/* 404 fallback */}
        <Route>
          <div className="flex h-screen w-screen items-center justify-center bg-background">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-foreground/20">404</h1>
              <p className="mt-2 text-muted-foreground">Page not found. The cat ate it. 🙀</p>
              <a href="/" className="mt-4 inline-block text-primary hover:underline">
                Go home
              </a>
            </div>
          </div>
        </Route>
      </Switch>
    </RootLayout>
  )
}

// Mount the app
const container = document.getElementById('root')

if (!container) {
  throw new Error('Root element not found. Did the cat eat that too? 🐱')
}

const root = createRoot(container)
root.render(<App />)
