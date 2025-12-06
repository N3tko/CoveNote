import type { UIMessage } from '@netko/ui/components/chat/messages-list/definitions/types'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * WebSocket Hook for Real-time Chat Streaming
 *
 * Manages WebSocket connections for live message updates.
 * Like carrier pigeons, but faster. And digital. 🐦➡️📨🐱
 */

// Event types from the server
export type ThreadEventType =
  | 'message_created'
  | 'message_streaming'
  | 'message_completed'
  | 'message_error'
  | 'connected'
  | 'ping'

export interface ThreadEvent {
  type: ThreadEventType
  timestamp?: number | string
  messageId?: string
  content?: string
  message?: UIMessage | Record<string, unknown>
  threadId?: string
}

export interface UseWebSocketOptions {
  threadId: string | undefined
  lastEventId?: string | null
  onMessageCreated?: (message: UIMessage) => void
  onMessageStreaming?: (messageId: string, content: string) => void
  onMessageCompleted?: (message: UIMessage) => void
  onMessageError?: () => void
  onConnected?: () => void
  enabled?: boolean
}

export interface UseWebSocketReturn {
  isConnected: boolean
  lastEventId: string | null
  reconnect: () => void
  disconnect: () => void
}

/**
 * Hook for managing WebSocket connections to the chat streaming endpoint
 */
export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const {
    threadId,
    lastEventId: initialLastEventId,
    onMessageCreated,
    onMessageStreaming,
    onMessageCompleted,
    onMessageError,
    onConnected,
    enabled = true,
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [lastEventId, setLastEventId] = useState<string | null>(initialLastEventId ?? null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const getWsUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    let url = `${protocol}//${host}/api/v1/ws`

    const params = new URLSearchParams()
    if (threadId) params.set('threadId', threadId)
    if (lastEventId) params.set('lastEventId', lastEventId)

    const queryString = params.toString()
    if (queryString) url += `?${queryString}`

    return url
  }, [threadId, lastEventId])

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as ThreadEvent

        switch (data.type) {
          case 'connected':
            onConnected?.()
            break

          case 'message_created': {
            if (data.message) {
              const newMessage: UIMessage = {
                ...(data.message as UIMessage),
                createdAt: new Date((data.message as { createdAt?: string | Date })?.createdAt ?? Date.now()),
                isGenerating: false,
              }
              onMessageCreated?.(newMessage)
            }
            break
          }

          case 'message_streaming': {
            if (data.messageId && data.content !== undefined) {
              onMessageStreaming?.(data.messageId, data.content)
            }
            break
          }

          case 'message_completed': {
            if (data.message) {
              const completedMessage: UIMessage = {
                ...(data.message as UIMessage),
                createdAt: new Date((data.message as { createdAt?: string | Date })?.createdAt ?? Date.now()),
                isGenerating: false,
              }
              onMessageCompleted?.(completedMessage)
            }
            break
          }

          case 'message_error':
            onMessageError?.()
            break

          case 'ping':
            // Keep-alive, no action needed
            break
        }

        // Update last event ID for reconnection
        if (data.timestamp) {
          setLastEventId(String(data.timestamp))
        }
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:', error)
      }
    },
    [onConnected, onMessageCreated, onMessageStreaming, onMessageCompleted, onMessageError],
  )

  const connect = useCallback(() => {
    if (!enabled || !threadId) return

    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close()
    }

    try {
      const url = getWsUrl()
      const ws = new WebSocket(url)

      ws.onopen = () => {
        setIsConnected(true)
        reconnectAttempts.current = 0
        console.log('🔌 WebSocket connected')
      }

      ws.onmessage = handleMessage

      ws.onclose = (event) => {
        setIsConnected(false)
        console.log(`🔌 WebSocket closed: ${event.code} - ${event.reason}`)

        // Attempt reconnection if not intentionally closed
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000)
          reconnectAttempts.current++

          console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`)
          reconnectTimeoutRef.current = setTimeout(connect, delay)
        }
      }

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
      }

      wsRef.current = ws
    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error)
    }
  }, [enabled, threadId, getWsUrl, handleMessage])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect')
      wsRef.current = null
    }

    setIsConnected(false)
    reconnectAttempts.current = 0
  }, [])

  const reconnect = useCallback(() => {
    disconnect()
    reconnectAttempts.current = 0
    connect()
  }, [disconnect, connect])

  // Connect when enabled and threadId changes
  useEffect(() => {
    if (enabled && threadId) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [enabled, threadId, connect, disconnect])

  return {
    isConnected,
    lastEventId,
    reconnect,
    disconnect,
  }
}

