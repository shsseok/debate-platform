'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface Room {
  id: number
  topic: string
  type: 'RANDOM' | 'TOPIC'
  status: 'WAITING' | 'ACTIVE' | 'ENDED'
  proUserId: number | null
  conUserId: number | null
  proNickname: string | null
  conNickname: string | null
  createdAt: string
}

const STATUS_FILTER = ['전체', '대기 중', '진행 중', '종료'] as const
type FilterLabel = (typeof STATUS_FILTER)[number]

const labelToStatus: Record<FilterLabel, string | null> = {
  '전체': null,
  '대기 중': 'WAITING',
  '진행 중': 'ACTIVE',
  '종료': 'ENDED',
}

const statusBadge: Record<string, 'waiting' | 'active' | 'ended'> = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  ENDED: 'ended',
}

export default function RoomsPage() {
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterLabel>('전체')

  useEffect(() => {
    api.get('/rooms')
      .then((res) => setRooms(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = rooms.filter((r) => {
    const target = labelToStatus[filter]
    return target === null || r.status === target
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">토론방 목록</h1>
          <p className="text-muted text-sm mt-1">
            {rooms.filter((r) => r.status !== 'ENDED').length}개의 토론방이 열려 있습니다
          </p>
        </div>
        <Button onClick={() => router.push('/rooms/create')}>
          + 방 만들기
        </Button>
      </div>

      <div className="flex gap-2 mb-5">
        {STATUS_FILTER.map((label) => (
          <button
            key={label}
            onClick={() => setFilter(label)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === label
                ? 'bg-primary text-white'
                : 'bg-surface text-muted border border-border hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 bg-surface border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-lg font-medium">토론방이 없습니다</p>
          <p className="text-sm mt-1">첫 번째 토론방을 만들어보세요!</p>
          <Button className="mt-4" onClick={() => router.push('/rooms/create')}>
            방 만들기
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((room) => (
            <RoomCard key={room.id} room={room} onClick={() => router.push(`/rooms/${room.id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}

function RoomCard({ room, onClick }: { room: Room; onClick: () => void }) {
  const proSlot = room.proNickname ?? (room.proUserId ? '참가자' : '빈 자리')
  const conSlot = room.conNickname ?? (room.conUserId ? '참가자' : '빈 자리')
  const isProEmpty = !room.proUserId
  const isConEmpty = !room.conUserId

  return (
    <Card hover onClick={onClick}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-base leading-snug">{room.topic}</CardTitle>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge variant={statusBadge[room.status]} />
            <Badge variant="default" className="text-xs">
              {room.type === 'RANDOM' ? '랜덤' : '주제'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mt-3">
          <div className={`flex-1 rounded-lg px-3 py-2 text-center text-xs font-medium border ${
            isProEmpty
              ? 'border-pro/30 bg-pro/10 text-pro'
              : 'border-border bg-surface text-muted'
          }`}>
            <span className="block text-[10px] text-muted mb-0.5">찬성</span>
            {isProEmpty ? '+ 빈 자리' : proSlot}
          </div>
          <div className={`flex-1 rounded-lg px-3 py-2 text-center text-xs font-medium border ${
            isConEmpty
              ? 'border-con/30 bg-con/10 text-con'
              : 'border-border bg-surface text-muted'
          }`}>
            <span className="block text-[10px] text-muted mb-0.5">반대</span>
            {isConEmpty ? '+ 빈 자리' : conSlot}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
