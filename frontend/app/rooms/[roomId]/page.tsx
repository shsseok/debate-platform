'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { useDebateStore } from '@/store/useDebateStore'
import { CopyLinkButton } from '@/components/ui/CopyLinkButton'

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

type Role = 'PRO' | 'CON' | 'SPECTATOR'

const statusBadge: Record<string, 'waiting' | 'active' | 'ended'> = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  ENDED: 'ended',
}

export default function RoomDetailPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = Number(params.roomId)

  const { token, user } = useAuthStore()
  const { setCurrentRoom, setMyRole } = useDebateStore()

  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    api.get(`/rooms/${roomId}`)
      .then((res) => setRoom(res.data))
      .catch(() => setError('방 정보를 불러올 수 없습니다.'))
      .finally(() => setLoading(false))
  }, [roomId])

  const handleJoin = async (role: Role) => {
    if ((role === 'PRO' || role === 'CON') && !token) {
      // 로그인 후 이 페이지로 돌아오도록 returnUrl 보존
      const currentPath = `/rooms/${roomId}`
      router.push(`/login?returnUrl=${encodeURIComponent(currentPath)}`)
      return
    }

    setJoining(true)
    setError('')
    try {
      await api.post(`/rooms/${roomId}/join`, { role })
      setCurrentRoom(room ? {
        id: room.id,
        topic: room.topic,
        type: room.type,
        status: room.status,
        proUserId: room.proUserId ? String(room.proUserId) : null,
        conUserId: room.conUserId ? String(room.conUserId) : null,
      } : null)
      setMyRole(role)
      router.push(`/debate/${roomId}`)
    } catch (err: any) {
      setError(err.response?.data?.message ?? '입장에 실패했습니다.')
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto mt-10">
        <div className="h-48 bg-surface border border-border rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error && !room) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center">
        <p className="text-4xl mb-3">😕</p>
        <p className="text-lg font-semibold text-white">{error}</p>
        <Button className="mt-4" variant="outline" onClick={() => router.push('/rooms')}>
          목록으로
        </Button>
      </div>
    )
  }

  if (!room) return null

  const proFilled = !!room.proUserId
  const conFilled = !!room.conUserId
  const isEnded = room.status === 'ENDED'

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push('/rooms')}
          className="text-muted text-sm hover:text-white transition-colors flex items-center gap-1"
        >
          ← 목록으로
        </button>
        <CopyLinkButton url={typeof window !== 'undefined' ? window.location.href : ''} label="참가 링크 복사" />
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h1 className="text-xl font-bold text-white leading-snug">{room.topic}</h1>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <Badge variant={statusBadge[room.status]} />
            <Badge variant="default">{room.type === 'RANDOM' ? '랜덤' : '주제'}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className={`rounded-xl p-4 border text-center ${
            proFilled ? 'border-border bg-background' : 'border-pro/40 bg-pro/5'
          }`}>
            <p className="text-xs text-muted mb-1">찬성</p>
            {proFilled ? (
              <p className="text-sm font-medium text-white">{room.proNickname ?? '참가자'}</p>
            ) : (
              <p className="text-sm text-pro font-medium">빈 자리</p>
            )}
          </div>
          <div className={`rounded-xl p-4 border text-center ${
            conFilled ? 'border-border bg-background' : 'border-con/40 bg-con/5'
          }`}>
            <p className="text-xs text-muted mb-1">반대</p>
            {conFilled ? (
              <p className="text-sm font-medium text-white">{room.conNickname ?? '참가자'}</p>
            ) : (
              <p className="text-sm text-con font-medium">빈 자리</p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2 mb-4">
          {error}
        </p>
      )}

      {isEnded ? (
        <div className="text-center py-6 text-muted">
          <p className="text-lg font-medium">종료된 토론방입니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted text-center mb-4">역할을 선택해 입장하세요</p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="pro"
              size="lg"
              disabled={proFilled || joining}
              onClick={() => handleJoin('PRO')}
              className="flex flex-col h-auto py-4 gap-1"
            >
              <span className="text-base">👍</span>
              <span className="font-semibold">찬성으로 입장</span>
              {proFilled && <span className="text-xs opacity-70">자리 없음</span>}
            </Button>
            <Button
              variant="con"
              size="lg"
              disabled={conFilled || joining}
              onClick={() => handleJoin('CON')}
              className="flex flex-col h-auto py-4 gap-1"
            >
              <span className="text-base">👎</span>
              <span className="font-semibold">반대로 입장</span>
              {conFilled && <span className="text-xs opacity-70">자리 없음</span>}
            </Button>
          </div>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            disabled={joining}
            onClick={() => handleJoin('SPECTATOR')}
          >
            👀 관전자로 입장 {!token && <span className="text-xs text-muted ml-1">(비로그인 가능)</span>}
          </Button>
        </div>
      )}
    </div>
  )
}
