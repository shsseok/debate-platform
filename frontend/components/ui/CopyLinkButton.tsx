'use client'

import { useState } from 'react'

interface CopyLinkButtonProps {
  url: string
  label?: string
}

export function CopyLinkButton({ url, label = '링크 복사' }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API 미지원 환경 fallback
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
        copied
          ? 'border-green-500/40 bg-green-500/10 text-green-400'
          : 'border-border bg-surface text-muted hover:text-white hover:border-primary/50'
      }`}
    >
      {copied ? (
        <>✓ 복사됨</>
      ) : (
        <>🔗 {label}</>
      )}
    </button>
  )
}
