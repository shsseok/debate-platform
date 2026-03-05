'use client'

import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/rooms`,
      },
    })
  }

  return (
    <main>
      <h1>토론 대결 플랫폼</h1>
      <button onClick={handleGoogleLogin}>Google로 시작하기</button>
    </main>
  )
}
