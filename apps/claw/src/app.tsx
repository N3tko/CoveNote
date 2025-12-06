import { createRoot } from 'react-dom/client'
import { Link, Route, Switch } from 'wouter'

// 🏠 Layout component with navigation
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="border-b border-white/10 backdrop-blur-sm bg-black/20 px-6 py-4">
        <ul className="flex gap-6 text-white/80">
          <li>
            <Link to="/" className="hover:text-cyan-400 transition-colors">
              🏠 Home
            </Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-cyan-400 transition-colors">
              📖 About
            </Link>
          </li>
          <li>
            <Link to="/dashboard" className="hover:text-cyan-400 transition-colors">
              📊 Dashboard
            </Link>
          </li>
        </ul>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}

// 🏠 Home page
function Home() {
  return (
    <div className="text-white">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
        Welcome Home, Human! 🐱
      </h1>
      <p className="mt-4 text-white/70">You've successfully set up Wouter. Meow.</p>
    </div>
  )
}

// 📖 About page
function About() {
  return (
    <div className="text-white">
      <h1 className="text-4xl font-bold text-purple-400">About This App</h1>
      <p className="mt-4 text-white/70">Just another day shipping code and petting cats. 🐈</p>
    </div>
  )
}

// 📊 Dashboard page
function Dashboard() {
  return (
    <div className="text-white">
      <h1 className="text-4xl font-bold text-cyan-400">Dashboard</h1>
      <p className="mt-4 text-white/70">Your metrics are looking purrfect today. 📈</p>
    </div>
  )
}

// 🚀 App with routes
function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/dashboard" component={Dashboard} />
        <Route>404: Page not found 🙀</Route>
      </Switch>
    </Layout>
  )
}

const container = document.getElementById('root')

if (!container) {
  throw new Error('Root element not found')
}

const root = createRoot(container)
root.render(<App />)
