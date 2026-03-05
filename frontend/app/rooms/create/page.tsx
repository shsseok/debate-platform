'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'

type RoomType = 'RANDOM' | 'TOPIC'

export default function CreateRoomPage() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const [roomType, setRoomType] = useState<RoomType>('RANDOM')
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <p className="text-4xl mb-4">🔒</p>
        <p className="text-lg font-semibold text-white mb-2">로그인이 필요합니다</p>
        <p className="text-muted text-sm mb-6">토론방을 만들려면 먼저 로그인하세요.</p>
        <Button onClick={() => router.push('/login')}>로그인하기</Button>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (roomType === 'TOPIC' && !topic.trim()) {
      setError('주제를 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/rooms', {
        type: roomType,
        topic: roomType === 'TOPIC' ? topic.trim() : undefined,
      })
      router.push(`/rooms/${res.data.id}`)
    } catch (err: any) {
      setError(err.response?.data?.message ?? '방 생성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <button
        onClick={() => router.back()}
        className="text-muted text-sm hover:text-white transition-colors mb-6 flex items-center gap-1"
      >
        ← 뒤로
      </button>

      <h1 className="text-2xl font-bold text-white mb-6">토론방 만들기</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white mb-3">방 종류</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRoomType('RANDOM')}
              className={`p-4 rounded-xl border text-left transition-all ${
                roomType === 'RANDOM'
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-surface hover:border-primary/50'
              }`}
            >
              <p className="text-lg mb-1">🎲</p>
              <p className="font-semibold text-white text-sm">랜덤 주제</p>
              <p className="text-xs text-muted mt-1">서버가 주제를 자동 선정</p>
            </button>
            <button
              type="button"
              onClick={() => setRoomType('TOPIC')}
              className={`p-4 rounded-xl border text-left transition-all ${
                roomType === 'TOPIC'
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-surface hover:border-primary/50'
              }`}
            >
              <p className="text-lg mb-1">✏️</p>
              <p className="font-semibold text-white text-sm">주제 지정</p>
              <p className="text-xs text-muted mt-1">직접 주제를 입력</p>
            </button>
          </div>
        </div>

        {roomType === 'TOPIC' && (
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              토론 주제
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="예: 인공지능은 인간의 일자리를 대체해야 한다"
              maxLength={200}
              rows={3}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white text-sm placeholder-muted resize-none focus:outline-none focus:border-primary transition-colors"
            />
            <p className="text-xs text-muted mt-1 text-right">{topic.length} / 200</p>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? '생성 중...' : '토론방 만들기'}
        </Button>
      </form>

      <div className="mt-6 p-4 bg-surface border border-border rounded-xl text-sm text-muted">
        <p className="font-medium text-white mb-2">안내</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>방을 만들면 자동으로 <span className="text-pro">찬성</span> 자리에 배정됩니다.</li>
          <li>상대방이 <span className="text-con">반대</span> 자리에 입장하면 토론이 시작됩니다.</li>
          <li>링크를 공유해 관전자를 초대할 수 있습니다.</li>
        </ul>
      </div>
    </div>
  )
}
