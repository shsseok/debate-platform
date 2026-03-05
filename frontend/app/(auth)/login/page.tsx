'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { getGoogleLoginUrl, getKakaoLoginUrl } from '@/lib/auth'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const returnUrl = searchParams.get('returnUrl')

  // returnUrl을 localStorage에 저장 (OAuth 리다이렉트 후 복원용)
  useEffect(() => {
    if (returnUrl) {
      localStorage.setItem('returnUrl', returnUrl)
    }
  }, [returnUrl])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-4xl mb-3">⚔️</p>
          <h1 className="text-2xl font-bold text-white">토론 대결 플랫폼</h1>
          <p className="text-muted text-sm mt-2">소셜 계정으로 시작하세요</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 space-y-3">
          <a
            href={getGoogleLoginUrl()}
            className="flex items-center justify-center gap-3 w-full px-5 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700 text-sm"
          >
            <GoogleIcon />
            Google로 시작하기
          </a>

          <a
            href={getKakaoLoginUrl()}
            className="flex items-center justify-center gap-3 w-full px-5 py-3 bg-yellow-300 border border-yellow-400 rounded-xl hover:bg-yellow-400 transition-colors font-medium text-gray-800 text-sm"
          >
            <KakaoIcon />
            카카오로 시작하기
          </a>

          {returnUrl && (
            <>
              <div className="flex items-center gap-2 my-1">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted">또는</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <button
                onClick={() => router.push(returnUrl)}
                className="w-full px-5 py-3 border border-border rounded-xl text-sm text-muted hover:text-white hover:border-primary/50 transition-colors"
              >
                👀 로그인 없이 관전자로 계속하기
              </button>
            </>
          )}
        </div>

        <p className="text-center text-xs text-muted mt-4">
          관전자로 참여할 경우 로그인이 필요 없습니다
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function KakaoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#3C1E1E">
      <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.7 1.56 5.1 3.93 6.54L5 21l4.5-2.4c.82.2 1.66.3 2.5.3 5.52 0 10-3.48 10-7.8S17.52 3 12 3z" />
    </svg>
  )
}
