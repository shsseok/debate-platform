'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

export function NavBar() {
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()

  const handleLogout = async () => {
    try { await api.post('/api/auth/logout') } catch {}
    clearAuth()
    router.push('/rooms')
  }

  return (
    <nav className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/rooms"
          className="text-lg font-bold text-white hover:text-primary transition-colors"
        >
          ⚔️ 토론 대결
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/rooms"
            className="text-sm text-muted hover:text-white transition-colors"
          >
            토론방 목록
          </Link>

          {user ? (
            <>
              <span className="text-border">|</span>
              <span className="text-sm text-white font-medium">{user.nickname}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-muted hover:text-white transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
