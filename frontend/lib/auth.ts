const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api'

export function getGoogleLoginUrl(): string {
  const backendUrl = API_URL.replace('/api', '')
  return `${backendUrl}/oauth2/authorization/google`
}

export function getKakaoLoginUrl(): string {
  const backendUrl = API_URL.replace('/api', '')
  return `${backendUrl}/oauth2/authorization/kakao`
}

export function parseJwt(token: string): { sub: string; email: string; nickname: string } | null {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

export async function fetchMe(token: string) {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('인증 실패')
  return res.json()
}
