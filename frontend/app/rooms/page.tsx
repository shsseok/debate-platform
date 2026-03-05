'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

interface Room {
  id: number
  topic: string
  type: 'RANDOM' | 'TOPIC'
  status: 'WAITING' | 'ACTIVE' | 'ENDED'
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/rooms')
      .then((res) => setRooms(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>로딩 중...</div>

  return (
    <main>
      <h1>토론방 목록</h1>
      {rooms.length === 0 ? (
        <p>현재 열린 토론방이 없습니다.</p>
      ) : (
        <ul>
          {rooms.map((room) => (
            <li key={room.id}>{room.topic}</li>
          ))}
        </ul>
      )}
    </main>
  )
}
