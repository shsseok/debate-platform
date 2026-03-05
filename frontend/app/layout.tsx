import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '토론 대결',
  description: '실시간 1vs1 토론 대결 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-background text-white">
        <nav className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <a
              href="/rooms"
              className="text-lg font-bold text-white hover:text-primary transition-colors"
            >
              ⚔️ 토론 대결
            </a>
            <div className="flex items-center gap-3">
              <a
                href="/rooms"
                className="text-sm text-muted hover:text-white transition-colors"
              >
                토론방 목록
              </a>
            </div>
          </div>
        </nav>
        <div className="max-w-6xl mx-auto px-4 py-6">
          {children}
        </div>
      </body>
    </html>
  )
}
