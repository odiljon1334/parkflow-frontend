import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { VehicleSession } from '../types'

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'

interface SocketEvents {
  onEntry?: (session: VehicleSession) => void
  onExit?:  (session: VehicleSession) => void
  onCount?: (data: { parkingId: string; count: number }) => void
}

export function useSocket(parkingId: string | null, events: SocketEvents) {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!parkingId) return

    const socket = io(SOCKET_URL, { transports: ['websocket'] })
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('join:parking', parkingId)
    })

    if (events.onEntry) socket.on('vehicle:entry', events.onEntry)
    if (events.onExit)  socket.on('vehicle:exit',  events.onExit)
    if (events.onCount) socket.on('inside:count',  events.onCount)

    return () => {
      socket.disconnect()
    }
  }, [parkingId])

  return socketRef
}
