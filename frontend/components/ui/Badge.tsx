import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'pro' | 'con' | 'spectator' | 'waiting' | 'active' | 'ended' | 'default'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, string> = {
  pro: 'bg-pro/20 text-pro border-pro/30',
  con: 'bg-con/20 text-con border-con/30',
  spectator: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  waiting: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  ended: 'bg-muted/20 text-muted border-muted/30',
  default: 'bg-primary/20 text-primary border-primary/30',
}

const variantLabels: Partial<Record<BadgeVariant, string>> = {
  pro: '찬성',
  con: '반대',
  spectator: '관전자',
  waiting: '대기 중',
  active: '진행 중',
  ended: '종료',
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children ?? variantLabels[variant]}
    </span>
  )
}
