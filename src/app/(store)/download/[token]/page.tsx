'use client'

import { useEffect, useState, useRef } from 'react'
import { use } from 'react'
import { Download, Clock, Lock, AlertTriangle, Loader2 } from 'lucide-react'
import FloatingAnimation from '@/components/FloatingAnimation'

type Status = 'loading' | 'ready' | 'downloading' | 'expired' | 'used' | 'error'

export default function DownloadPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = use(params)
  const [status, setStatus] = useState<Status>('loading')
  const [productName, setProductName] = useState('')
  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    // GET: 토큰 검증만 (소진 안 함)
    fetch(`/api/download/${token}`)
      .then(async res => {
        const data = await res.json()
        if (res.ok) {
          setProductName(data.productName)
          setStatus('ready')
        } else if (data.error === 'expired') {
          setStatus('expired')
        } else if (data.error === 'used') {
          setStatus('used')
        } else {
          setStatus('error')
        }
      })
      .catch(() => setStatus('error'))
  }, [token])

  const handleDownload = async () => {
    setStatus('downloading')

    try {
      // POST: 실제 다운로드 (토큰 소진 + signed URL)
      const res = await fetch(`/api/download/${token}`, { method: 'POST' })
      const data = await res.json()

      if (res.ok) {
        window.location.href = data.downloadUrl
        // 잠시 후 used 상태로 전환
        setTimeout(() => setStatus('used'), 2000)
      } else if (data.error === 'used') {
        setStatus('used')
      } else if (data.error === 'expired') {
        setStatus('expired')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const states = {
    loading: { icon: Loader2, title: 'Preparing your download...', desc: '', iconClass: 'animate-spin text-accent' },
    ready: { icon: Download, title: productName, desc: 'Your file is ready for download.', iconClass: 'text-emerald-400' },
    downloading: { icon: Loader2, title: '다운로드 준비 중...', desc: '', iconClass: 'animate-spin text-accent' },
    expired: { icon: Clock, title: 'Link Expired', desc: 'This download link has expired. Please contact support.', iconClass: 'text-amber-400' },
    used: { icon: Lock, title: 'Already Downloaded', desc: 'This link has already been used. Contact support for a new link.', iconClass: 'text-text-muted' },
    error: { icon: AlertTriangle, title: 'Invalid Link', desc: 'This download link is not valid.', iconClass: 'text-red-400' },
  }

  const current = states[status]
  const IconComponent = current.icon

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <FloatingAnimation
        colorStops={['#764105', '#1818E7', '#FF299B']}
        amplitude={0.6}
        blend={0.6}
        speed={0.5}
        className="absolute inset-0"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--bg-deep)_65%)]" />

      <div className="relative z-10 glass rounded-2xl p-10 max-w-md w-full mx-6 text-center">
        <h2 className="font-display font-bold text-sm uppercase tracking-widest text-accent mb-8">Night Call Audio</h2>

        <div className="w-16 h-16 rounded-2xl bg-bg-deep/80 flex items-center justify-center mx-auto mb-6">
          <IconComponent size={28} className={current.iconClass} />
        </div>

        <h1 className="font-display font-bold text-2xl">{current.title}</h1>
        {current.desc && <p className="text-text-secondary mt-3 text-sm">{current.desc}</p>}

        {status === 'ready' && (
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 bg-accent text-bg-deep font-bold rounded-full hover:bg-accent-bright transition-colors text-sm btn-glow relative z-10"
          >
            <Download size={16} /> Download Now
          </button>
        )}

        {status === 'ready' && (
          <p className="text-xs text-text-muted mt-6">This is a one-time download link.</p>
        )}
      </div>
    </div>
  )
}
