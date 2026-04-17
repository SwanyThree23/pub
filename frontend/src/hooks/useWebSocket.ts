import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function useWebSocket() {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000')

      socket.on('connect', () => {
        console.log('WebSocket connected')
        setConnected(true)

        // Authenticate (in real app, use actual userId)
        const userId = localStorage.getItem('userId')
        if (userId) {
          socket?.emit('auth', userId)
        }
      })

      socket.on('disconnect', () => {
        console.log('WebSocket disconnected')
        setConnected(false)
      })
    }

    return () => {
      // Don't disconnect on component unmount, keep connection alive
    }
  }, [])

  return {
    socket,
    connected,
    emit: (event: string, data: any) => socket?.emit(event, data),
    on: (event: string, callback: (data: any) => void) => socket?.on(event, callback),
    off: (event: string, callback: (data: any) => void) => socket?.off(event, callback)
  }
}
