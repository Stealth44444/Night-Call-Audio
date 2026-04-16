'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simple cookie setting for agent demo (real prod should use an API + HTTP-only cookie)
    // But since middleware checks the cookie value, we can set it here for simplicity
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })

    if (res.ok) {
      router.push('/admin')
      router.refresh()
    } else {
      setError('올바르지 않은 비밀번호입니다.')
    }
  }

  return (
    <div className="min-h-screen bg-bg-deep flex items-center justify-center p-6">
      <div className="w-full max-w-sm glass rounded-3xl p-8 space-y-8">
        <div className="text-center">
          <h1 className="font-display font-bold text-2xl mb-2">Admin Login</h1>
          <p className="text-sm text-text-muted">관리자 암호를 입력하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full px-4 py-3 bg-bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-accent text-bg-deep font-bold rounded-xl hover:bg-accent-bright transition-all btn-glow"
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  )
}
