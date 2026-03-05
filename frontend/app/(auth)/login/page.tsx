'use client'

import { getGoogleLoginUrl, getKakaoLoginUrl } from '@/lib/auth'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-900">토론 대결 플랫폼</h1>
      <p className="text-gray-500">소셜 계정으로 시작하세요</p>

      <div className="flex flex-col gap-3 w-72">
        <a
          href={getGoogleLoginUrl()}
          className="flex items-center justify-center gap-3 px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors font-medium text-gray-700"
        >
          <GoogleIcon />
          Google로 시작하기
        </a>

        <a
          href={getKakaoLoginUrl()}
          className="flex items-center justify-center gap-3 px-6 py-3 bg-yellow-300 border border-yellow-400 rounded-lg shadow-sm hover:bg-yellow-400 transition-colors font-medium text-gray-800"
        >
          <KakaoIcon />
          카카오로 시작하기
        </a>
      </div>
    </main>
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
