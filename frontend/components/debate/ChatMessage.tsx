import { cn } from '@/lib/utils'

export interface Message {
  id: number
  roomId: number
  userId: number
  nickname: string
  role: 'PRO' | 'CON'
  content: string
  sentAt: string
}

interface ChatMessageProps {
  message: Message
  isMe: boolean
}

export function ChatMessage({ message, isMe }: ChatMessageProps) {
  const isPro = message.role === 'PRO'

  return (
    <div className={cn('flex gap-2.5', isMe ? 'flex-row-reverse' : 'flex-row')}>
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5',
        isPro ? 'bg-pro/20 text-pro' : 'bg-con/20 text-con'
      )}>
        {isPro ? '찬' : '반'}
      </div>

      <div className={cn('max-w-[70%]', isMe ? 'items-end' : 'items-start', 'flex flex-col gap-1')}>
        <div className={cn('flex items-center gap-1.5 text-xs', isMe && 'flex-row-reverse')}>
          <span className={cn('font-medium', isPro ? 'text-pro' : 'text-con')}>
            {message.nickname}
          </span>
          <span className="text-muted">
            {new Date(message.sentAt).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        <div className={cn(
          'px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words',
          isMe
            ? isPro
              ? 'bg-pro text-white rounded-tr-sm'
              : 'bg-con text-white rounded-tr-sm'
            : 'bg-surface border border-border text-white rounded-tl-sm'
        )}>
          {message.content}
        </div>
      </div>
    </div>
  )
}
