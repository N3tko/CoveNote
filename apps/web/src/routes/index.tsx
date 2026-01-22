import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { backend } from '@/integrations/backend'
import { client } from '@/integrations/eden'

export const Route = createFileRoute('/')({ component: TestPage })

type HealthStatus = {
  status: 'ok' | 'error'
  timestamp: number
  uptime: number
}

type ChatMessage = {
  id: string
  username: string
  message: string
  createdAt: Date
  timestamp?: number
}

type Todo = {
  id: string
  title: string
  description: string | null
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

function TestPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">API Test Page</h1>
      <p className="text-muted-foreground">
        Test all API functionalities: Backend health, WebSocket chat, and Todos CRUD
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        <HealthCheck />
        <ChatSection />
      </div>

      <TodosSection />
    </div>
  )
}

function HealthCheck() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkHealth = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: apiError } = await backend.health.get()
      if (apiError) {
        setError('Failed to fetch health status')
        return
      }
      setHealth(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backend Health Check</CardTitle>
        <CardDescription>Check the backend server health status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={checkHealth} disabled={loading}>
          {loading ? 'Checking...' : 'Check Health'}
        </Button>

        {error && <p className="text-destructive text-sm">{error}</p>}

        {health && (
          <div className="space-y-2 text-sm">
            <p>
              Status:{' '}
              <span className={health.status === 'ok' ? 'text-green-600' : 'text-red-600'}>
                {health.status}
              </span>
            </p>
            <p>Timestamp: {new Date(health.timestamp).toLocaleString()}</p>
            <p>Uptime: {Math.floor(health.uptime / 1000)}s</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ChatSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [username, setUsername] = useState('User')
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  const loadHistory = async () => {
    setLoading(true)
    try {
      const { data, error } = await backend.chat.history.get({ query: { limit: 20 } })
      if (!error && data) {
        setMessages(data as ChatMessage[])
      }
    } catch (err) {
      console.error('Failed to load history:', err)
    } finally {
      setLoading(false)
    }
  }

  const connectWebSocket = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3001'
    const wsUrl = `${backendUrl.replace('http', 'ws')}/chat/ws`

    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      setConnected(true)
      console.log('WebSocket connected')
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as ChatMessage
        setMessages((prev) => [...prev, msg])
      } catch (err) {
        console.error('Failed to parse message:', err)
      }
    }

    ws.onclose = () => {
      setConnected(false)
      console.log('WebSocket disconnected')
    }

    ws.onerror = (err) => {
      console.error('WebSocket error:', err)
      setConnected(false)
    }

    wsRef.current = ws
  }

  const disconnectWebSocket = () => {
    wsRef.current?.close()
    wsRef.current = null
    setConnected(false)
  }

  const sendMessage = () => {
    if (!wsRef.current || !newMessage.trim()) return

    wsRef.current.send(
      JSON.stringify({
        username,
        message: newMessage.trim(),
      }),
    )
    setNewMessage('')
  }

  useEffect(() => {
    return () => {
      wsRef.current?.close()
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>WebSocket Chat</CardTitle>
        <CardDescription>Real-time chat using WebSocket</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-32"
          />
          <Button onClick={loadHistory} disabled={loading} variant="outline">
            {loading ? 'Loading...' : 'Load History'}
          </Button>
          {connected ? (
            <Button onClick={disconnectWebSocket} variant="destructive">
              Disconnect
            </Button>
          ) : (
            <Button onClick={connectWebSocket}>Connect</Button>
          )}
        </div>

        <div className="h-48 overflow-y-auto border rounded p-2 space-y-1 text-sm bg-muted/50">
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No messages yet</p>
          ) : (
            messages.map((msg, i) => (
              <div key={msg.id ?? i} className="flex gap-2">
                <span className="font-semibold">{msg.username}:</span>
                <span>{msg.message}</span>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            disabled={!connected}
          />
          <Button onClick={sendMessage} disabled={!connected || !newMessage.trim()}>
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function TodosSection() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTodos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: apiError } = await client.api.todos.get()
      if (apiError) {
        setError('Failed to load todos')
        return
      }
      setTodos((data as Todo[]) ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  const createTodo = async () => {
    if (!newTitle.trim()) return
    setError(null)
    try {
      const { error: apiError } = await client.api.todos.post({
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
      })
      if (apiError) {
        setError('Failed to create todo')
        return
      }
      setNewTitle('')
      setNewDescription('')
      loadTodos()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      await client.api.todos({ id }).patch({ completed: !completed })
      loadTodos()
    } catch (err) {
      console.error('Failed to toggle todo:', err)
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      await client.api.todos({ id }).delete()
      loadTodos()
    } catch (err) {
      console.error('Failed to delete todo:', err)
    }
  }

  useEffect(() => {
    loadTodos()
  }, [loadTodos])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todos (Web API)</CardTitle>
        <CardDescription>CRUD operations using Eden Treaty on same-origin API</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Todo title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <Input
            placeholder="Description (optional)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
          <Button onClick={createTodo} disabled={!newTitle.trim()}>
            Add
          </Button>
          <Button onClick={loadTodos} variant="outline" disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Separator />

        <div className="space-y-2">
          {todos.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No todos yet</p>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 p-2 border rounded hover:bg-muted/50"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id, todo.completed)}
                  className="h-4 w-4"
                />
                <div className="flex-1">
                  <p className={todo.completed ? 'line-through text-muted-foreground' : ''}>
                    {todo.title}
                  </p>
                  {todo.description && (
                    <p className="text-sm text-muted-foreground">{todo.description}</p>
                  )}
                </div>
                <Button size="sm" variant="destructive" onClick={() => deleteTodo(todo.id)}>
                  Delete
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
