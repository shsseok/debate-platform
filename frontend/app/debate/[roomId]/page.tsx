'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { IMessage } from '@stomp/stompjs'
import api from '@/lib/api'
import { connectStomp, disconnectStomp, sendMessage } from '@/lib/stomp'
import { useAuthStore } from '@/store/authStore'
import { useDebateStore } from '@/store/useDebateStore'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ChatMessage, type Message } from '@/components/debate/ChatMessage'
import { VoteGauge } from '@/components/voting/VoteGauge'
import { VoteSlider } from '@/components/voting/VoteSlider'

interface Room {
  id: number
  topic: string
  type: 'RANDOM' | 'TOPIC'
  status: 'WAITING' | 'ACTIVE' | 'ENDED'
  proUserId: number | null
  conUserId: number | null
  proNickname: string | null
  conNickname: string | null
}

const statusBadge: Record<string, 'waiting' | 'active' | 'ended'> = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  ENDED: 'ended',
}

export default function DebatePage() {
  const params = useParams()
  const router = useRouter()
  const roomId = String(params.roomId)

  const { user } = useAuthStore()
  const { myRole, setCurrentRoom, setMyRole } = useDebateStore()

  const [room, setRoom] = useState<Room | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState(false)
  const [roomStatus, setRoomStatus] = useState<Room['status']>('WAITING')
  const [voteAverage, setVoteAverage] = useState(50)
  const [voterCount, setVoterCount] = useState(0)
  const [endResult, setEndResult] = useState<{ winner: string; voteAverage: number } | null>(null)
  const [ending, setEnding] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 현재 유저의 실제 역할 결정 (스토어 > 방 데이터로 추론)
  const resolvedRole = useCallback((r: Room) => {
    if (myRole) return myRole
    if (!user) return 'SPECTATOR'
    if (user.userId === r.proUserId) return 'PRO'
    if (user.userId === r.conUserId) return 'CON'
    return 'SPECTATOR'
  }, [myRole, user])

  const role = room ? resolvedRole(room) : myRole

  // 방 정보 + 이전 메시지 로드
  useEffect(() => {
    Promise.all([
      api.get(`/rooms/${roomId}`),
      api.get(`/debate/${roomId}/messages`),
    ]).then(([roomRes, msgRes]) => {
      setRoom(roomRes.data)
      setRoomStatus(roomRes.data.status)
      setMessages(msgRes.data)
      setCurrentRoom({
        id: roomRes.data.id,
        topic: roomRes.data.topic,
        type: roomRes.data.type,
        status: roomRes.data.status,
        proUserId: roomRes.data.proUserId ? String(roomRes.data.proUserId) : null,
        conUserId: roomRes.data.conUserId ? String(roomRes.data.conUserId) : null,
      })
      const inferredRole = resolvedRole(roomRes.data)
      if (!myRole) setMyRole(inferredRole as any)
    }).catch(() => router.push('/rooms'))
  }, [roomId])

  // STOMP 연결
  useEffect(() => {
    const client = connectStomp(
      roomId,
      (msg: IMessage) => {
        const data: Message = JSON.parse(msg.body)
        setMessages((prev) => [...prev, data])
      },
      (msg: IMessage) => {
        const data = JSON.parse(msg.body)
        setVoteAverage(data.average ?? 50)
        setVoterCount(data.voterCount ?? 0)
      },
      (msg: IMessage) => {
        const data = JSON.parse(msg.body)
        if (data.status) setRoomStatus(data.status)
        if (data.status === 'ENDED') {
          setEndResult({ winner: data.winner, voteAverage: data.voteAverage ?? 50 })
        }
      }
    )

    client.onConnect = () => setConnected(true)
    client.onDisconnect = () => setConnected(false)
    client.onStompError = () => setConnected(false)

    const originalOnConnect = client.onConnect
    client.onConnect = (frame) => {
      originalOnConnect?.(frame)
      setConnected(true)
    }

    return () => {
      disconnectStomp()
      setConnected(false)
    }
  }, [roomId])

  // 메시지 수신 시 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const content = input.trim()
    if (!content || !connected) return
    sendMessage(roomId, content)
    setInput('')
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const canSpeak = role === 'PRO' || role === 'CON'
  const isActive = roomStatus === 'ACTIVE'

  const handleEndRoom = async () => {
    if (!confirm('정말 토론을 종료하시겠습니까?')) return
    setEnding(true)
    try {
      await api.post(`/rooms/${roomId}/end`)
    } catch (err: any) {
      alert(err.response?.data?.message ?? '종료에 실패했습니다.')
      setEnding(false)
    }
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-muted">불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-3rem)] max-w-3xl mx-auto">
      {/* 상단 헤더 */}
      <div className="bg-surface border border-border rounded-xl p-4 mb-3 shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted mb-1">토론 주제</p>
            <h1 className="text-base font-bold text-white leading-snug">{room.topic}</h1>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge variant={statusBadge[roomStatus]} />
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} title={connected ? '연결됨' : '연결 끊김'} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className={`rounded-lg px-3 py-2 border text-center text-xs ${
            role === 'PRO'
              ? 'border-pro bg-pro/10'
              : 'border-border bg-background'
          }`}>
            <span className="block text-[10px] text-muted mb-0.5">찬성</span>
            <span className={role === 'PRO' ? 'text-pro font-semibold' : 'text-white'}>
              {room.proNickname ?? '대기 중'}
              {role === 'PRO' && ' (나)'}
            </span>
          </div>
          <div className={`rounded-lg px-3 py-2 border text-center text-xs ${
            role === 'CON'
              ? 'border-con bg-con/10'
              : 'border-border bg-background'
          }`}>
            <span className="block text-[10px] text-muted mb-0.5">반대</span>
            <span className={role === 'CON' ? 'text-con font-semibold' : 'text-white'}>
              {room.conNickname ?? '대기 중'}
              {role === 'CON' && ' (나)'}
            </span>
          </div>
        </div>

        {/* 실시간 여론 게이지 (컴팩트) */}
        {isActive && (
          <div className="mt-3">
            <VoteGauge average={voteAverage} voterCount={voterCount} compact />
          </div>
        )}
      </div>

      {/* 상태 배너 */}
      {!isActive && roomStatus === 'WAITING' && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 text-sm text-yellow-400 text-center mb-3 shrink-0">
          상대방이 입장하면 토론이 시작됩니다
        </div>
      )}
      {roomStatus === 'ENDED' && endResult && (
        <div className="bg-surface border border-border rounded-xl p-4 mb-3 shrink-0">
          <p className="text-center text-sm font-semibold text-white mb-3">토론 결과</p>
          <div className="text-center mb-3">
            <span className={`text-2xl font-bold ${
              endResult.winner === 'PRO' ? 'text-pro' :
              endResult.winner === 'CON' ? 'text-con' : 'text-muted'
            }`}>
              {endResult.winner === 'PRO' ? '찬성 승리' :
               endResult.winner === 'CON' ? '반대 승리' : '무승부'}
            </span>
          </div>
          <VoteGauge average={endResult.voteAverage} voterCount={voterCount} />
        </div>
      )}
      {roomStatus === 'ENDED' && !endResult && (
        <div className="bg-muted/10 border border-border rounded-xl px-4 py-3 text-sm text-muted text-center mb-3 shrink-0">
          토론이 종료되었습니다
        </div>
      )}

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto bg-surface border border-border rounded-xl p-4 space-y-4 mb-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted text-sm">
            {isActive ? '첫 번째 발언을 시작해보세요!' : '토론이 시작되면 발언이 여기에 표시됩니다.'}
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isMe={user?.userId === msg.userId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 관전자 투표 슬라이더 */}
      {role === 'SPECTATOR' && isActive && (
        <div className="mb-3 shrink-0">
          <VoteSlider roomId={roomId} />
        </div>
      )}

      {/* 입력창 + 종료 버튼 */}
      {canSpeak ? (
        <div className="bg-surface border border-border rounded-xl p-3 shrink-0 space-y-2">
          {!isActive ? (
            <p className="text-center text-sm text-muted py-2">토론이 시작되면 발언할 수 있습니다</p>
          ) : (
            <>
              <div className="flex gap-2 items-end">
                <div className={`w-2 h-2 rounded-full mb-3 shrink-0 ${role === 'PRO' ? 'bg-pro' : 'bg-con'}`} />
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`${role === 'PRO' ? '찬성' : '반대'} 측 발언을 입력하세요... (Enter로 전송, Shift+Enter 줄바꿈)`}
                  rows={2}
                  maxLength={1000}
                  className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm text-white placeholder-muted resize-none focus:outline-none focus:border-primary transition-colors"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || !connected}
                  variant={role === 'PRO' ? 'pro' : 'con'}
                  className="shrink-0"
                >
                  전송
                </Button>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEndRoom}
                  disabled={ending}
                  className="text-muted hover:text-red-400 hover:border-red-400/50"
                >
                  {ending ? '종료 중...' : '토론 종료'}
                </Button>
              </div>
            </>
          )}
        </div>
      ) : (
        !isActive && (
          <div className="bg-surface border border-border rounded-xl px-4 py-3 text-center text-sm text-muted shrink-0">
            토론이 시작되기를 기다리는 중...
          </div>
        )
      )}
    </div>
  )
}
