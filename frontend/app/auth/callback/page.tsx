'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { parseJwt } from '@/lib/auth'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAuth = useAuthStore((s) => s.setAuth)

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      router.replace('/login')
      return
    }

    const payload = parseJwt(token)
    if (!payload) {
      router.replace('/login')
      return
    }

    setAuth(token, {
      userId: Number(payload.sub),
      email: payload.email,
      nickname: payload.nickname,
    })

    // 로그인 전에 저장한 returnUrl로 돌아가기
    const returnUrl = localStorage.getItem('returnUrl')
    localStorage.removeItem('returnUrl')
    router.replace(returnUrl ?? '/rooms')
  }, [searchParams, setAuth, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted">로그인 처리 중...</p>
    </div>
  )
}
