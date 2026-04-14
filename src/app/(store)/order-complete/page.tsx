'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Download, BadgeCheck, Loader2, Mail, Clock } from 'lucide-react'
import FloatingAnimation from '@/components/FloatingAnimation'

interface DownloadItem {
  token: string
  productName: string
  expiresAt: string
  used: boolean
}

type Status = 'waiting-email' | 'polling' | 'ready' | 'timeout'

export default function OrderCompletePage() {
  const [email, setEmail] = useState('')
  const [inputEmail, setInputEmail] = useState('')
  const [downloads, setDownloads] = useState<DownloadItem[]>([])
  const [status, setStatus] = useState<Status>('waiting-email')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollCount = useRef(0)

  const startPolling = useCallback((targetEmail: string) => {
    pollCount.current = 0
    setStatus('polling')

    const fetchDownloads = async () => {
      try {
        const res = await fetch(`/api/my-orders?email=${encodeURIComponent(targetEmail)}`)
        const data = await res.json()

        if (data.downloads && data.downloads.length > 0) {
          setDownloads(data.downloads)
          setStatus('ready')
          if (pollRef.current) clearInterval(pollRef.current)
        } else {
          pollCount.current++
          if (pollCount.current >= 20) {
            setStatus('timeout')
            if (pollRef.current) clearInterval(pollRef.current)
          }
        }
      } catch {
        pollCount.current++
        if (pollCount.current >= 20) {
          setStatus('timeout')
          if (pollRef.current) clearInterval(pollRef.current)
        }
      }
    }

    fetchDownloads()
    pollRef.current = setInterval(fetchDownloads, 3000)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('nca_email')
    if (stored) {
      setEmail(stored)
      startPolling(stored)
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [startPolling])

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = inputEmail.trim().toLowerCase()
    if (!trimmed) return
    localStorage.setItem('nca_email', trimmed)
    setEmail(trimmed)
    if (pollRef.current) clearInterval(pollRef.current)
    startPolling(trimmed)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden py-20">
      <FloatingAnimation
        colorStops={['#764105', '#1818E7', '#FF299B']}
        amplitude={0.5}
        blend={0.5}
        speed={0.4}
        className="absolute inset-0"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--bg-deep)_70%)]" />

      <div className="relative z-10 w-full max-w-lg mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="font-display font-bold text-xs uppercase tracking-widest text-accent mb-3">Night Call Audio</p>
          {status === 'ready' ? (
            <div className="flex items-center justify-center gap-3 mb-2">
              <BadgeCheck size={28} className="text-emerald-400" />
              <h1 className="font-display font-extrabold text-3xl">구매 완료</h1>
            </div>
          ) : (
            <h1 className="font-display font-extrabold text-3xl mb-2">내 다운로드</h1>
          )}
        </div>

        <div className="glass rounded-2xl p-8">
          {/* Waiting for email */}
          {status === 'waiting-email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <p className="text-text-secondary text-sm text-center mb-6">
                구매 시 사용한 이메일을 입력하면 다운로드 링크를 확인할 수 있습니다.
              </p>
              <div>
                <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                  이메일 주소
                </label>
                <input
                  type="email"
                  value={inputEmail}
                  onChange={e => setInputEmail(e.target.value)}
                  placeholder="이메일을 입력하세요"
                  required
                  className="w-full px-4 py-3 bg-bg-deep border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-text-muted"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-accent text-bg-deep font-bold rounded-xl hover:bg-accent-bright transition-colors text-sm btn-glow"
              >
                다운로드 확인
              </button>
            </form>
          )}

          {/* Polling */}
          {status === 'polling' && (
            <div className="text-center py-6">
              <Loader2 size={32} className="animate-spin text-accent mx-auto mb-4" />
              <p className="font-display font-bold text-lg mb-2">결제 확인 중...</p>
              <p className="text-text-secondary text-sm">
                결제가 완료되면 자동으로 다운로드 링크가 표시됩니다.
              </p>
              <p className="text-text-muted text-xs mt-4">{email}</p>
            </div>
          )}

          {/* Downloads ready */}
          {status === 'ready' && (
            <div className="space-y-4">
              <p className="text-text-secondary text-sm text-center mb-6">
                구매하신 파일을 아래에서 다운로드하세요.
              </p>
              {downloads.map(item => (
                <div key={item.token} className="bg-bg-deep/60 rounded-xl p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-display font-bold text-sm truncate">{item.productName}</p>
                    <p className="text-text-muted text-xs mt-1 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(item.expiresAt).toLocaleDateString('ko-KR')} 까지
                    </p>
                  </div>
                  <Link
                    href={`/download/${item.token}`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-accent text-bg-deep font-bold rounded-full hover:bg-accent-bright transition-colors text-xs shrink-0 btn-glow"
                  >
                    <Download size={13} /> 다운로드
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Timeout */}
          {status === 'timeout' && (
            <div className="text-center py-6">
              <Mail size={32} className="text-accent mx-auto mb-4" />
              <p className="font-display font-bold text-lg mb-2">이메일을 확인하세요</p>
              <p className="text-text-secondary text-sm">
                결제 확인 후 다운로드 링크를 이메일로 발송했습니다.
                <br />잠시 후 다시 시도하거나 이메일을 확인해주세요.
              </p>
              <button
                onClick={() => startPolling(email)}
                className="mt-6 px-6 py-2.5 border border-border rounded-full text-sm hover:border-border-hover hover:bg-bg-elevated transition-colors"
              >
                다시 확인
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
