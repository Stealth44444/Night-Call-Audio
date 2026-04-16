'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, Loader2, Mail, RotateCcw, CheckCircle2 } from 'lucide-react'
import FloatingAnimation from '@/components/FloatingAnimation'

interface DownloadItem {
  token: string
  productName: string
  productImage: string | null
  expiresAt: string
  purchasedAt: string
  used: boolean
}

type Status = 'order-complete' | 'waiting-email' | 'polling' | 'ready' | 'timeout'

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function fmtShort(iso: string) {
  const d = new Date(iso)
  const yy = String(d.getFullYear()).slice(2)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yy}.${mm}.${dd}`
}

export default function OrderCompletePage() {
  const searchParams = useSearchParams()
  const isNewOrder = searchParams.get('new') === '1'

  const [email, setEmail] = useState('')
  const [inputEmail, setInputEmail] = useState('')
  const [downloads, setDownloads] = useState<DownloadItem[]>([])
  const [status, setStatus] = useState<Status>(isNewOrder ? 'order-complete' : 'waiting-email')
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
          if (pollCount.current >= 5) {
            setStatus('timeout')
            if (pollRef.current) clearInterval(pollRef.current)
          }
        }
      } catch {
        pollCount.current++
        if (pollCount.current >= 5) {
          setStatus('timeout')
          if (pollRef.current) clearInterval(pollRef.current)
        }
      }
    }

    fetchDownloads()
    pollRef.current = setInterval(fetchDownloads, 2000)
  }, [])

  useEffect(() => {
    // 새 주문 직후에는 폴링하지 않음
    if (isNewOrder) return

    const stored = localStorage.getItem('nca_email')
    if (stored) {
      setEmail(stored)
      startPolling(stored)
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [startPolling, isNewOrder])

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

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

      <div className="relative z-10 w-full max-w-3xl mx-auto px-6">

        {/* Header */}
        <div className="mb-10">
          <p className="font-display font-bold text-[10px] uppercase tracking-[0.25em] text-accent mb-4">
            Night Call Audio
          </p>
          <h1 className="font-display font-extrabold text-4xl leading-none tracking-tight">
            {status === 'ready' ? '구매 내역' : status === 'order-complete' ? '주문 완료' : '내 다운로드'}
          </h1>
          {(status === 'ready' || status === 'polling' || status === 'timeout') && email && (
            <p className="text-text-muted text-sm mt-2 font-mono">{email}</p>
          )}
        </div>

        {/* 주문 완료 (새 주문 직후) */}
        {status === 'order-complete' && (
          <div className="space-y-6">
            <div className="flex items-start gap-4 py-6 border-y border-border">
              <CheckCircle2 size={22} className="text-accent mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="font-display font-bold text-lg">주문이 접수되었습니다</p>
                <p className="text-text-secondary text-sm leading-relaxed">
                  입금 확인 후 이 페이지에서 다운로드할 수 있습니다.
                </p>
              </div>
            </div>

            <div className="bg-bg-deep/60 border border-border/60 rounded-xl px-5 py-4 space-y-2">
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-text-muted mb-3">안내</p>
              {[
                '입금 확인 후 이메일로 다운로드 링크를 발송합니다.',
                '처리까지 영업일 기준 1~2일이 소요될 수 있습니다.',
                '문의사항은 이메일로 연락해 주세요.',
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-accent text-xs mt-px shrink-0">—</span>
                  <p className="text-xs text-text-secondary">{text}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  const stored = localStorage.getItem('nca_email') ?? ''
                  if (stored) {
                    setEmail(stored)
                    startPolling(stored)
                  } else {
                    setStatus('waiting-email')
                  }
                }}
                className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary hover:border-border-hover transition-all"
              >
                <RotateCcw size={13} /> 다운로드 확인
              </button>
              <Link
                href="/"
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-text-muted hover:text-text-primary transition-colors"
              >
                쇼핑 계속하기 <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}

        {/* Waiting for email */}
        {status === 'waiting-email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <p className="text-text-secondary text-sm mb-6 leading-relaxed">
              구매 시 입력한 이메일 주소로 다운로드 항목을 확인합니다.
            </p>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1.5">
              이메일 주소
            </label>
            <input
              type="email"
              value={inputEmail}
              onChange={e => setInputEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 bg-transparent border border-border rounded-none text-sm font-mono focus:outline-none focus:border-accent transition-colors placeholder:text-text-muted/40 tracking-wide"
            />
            <button
              type="submit"
              className="w-full py-3 bg-accent text-bg-deep font-bold tracking-widest text-xs uppercase transition-colors hover:bg-accent-bright btn-glow"
            >
              확인
            </button>
          </form>
        )}

        {/* Polling */}
        {status === 'polling' && (
          <div className="py-12">
            <div className="flex items-center gap-3 mb-3">
              <Loader2 size={16} className="animate-spin text-accent" />
              <p className="font-mono text-sm text-text-secondary tracking-wide">결제 확인 중...</p>
            </div>
            <div className="w-full h-px bg-border mt-6">
              <div className="h-px bg-accent animate-[progress_3s_ease-in-out_infinite]" style={{ width: '60%' }} />
            </div>
            <p className="font-mono text-xs text-text-muted mt-3">{email}</p>
          </div>
        )}

        {/* Downloads ready */}
        {status === 'ready' && (
          <div className="space-y-px">
            {downloads.map((item, idx) => (
              <DownloadCard key={item.token} item={item} index={idx} />
            ))}
          </div>
        )}

        {/* Timeout */}
        {status === 'timeout' && (
          <div className="py-10 border border-border">
            <div className="px-8">
              <Mail size={20} className="text-accent mb-5" />
              <p className="font-display font-bold text-xl mb-3">입금 확인 중입니다</p>
              <p className="text-text-secondary text-sm leading-relaxed">
                입금이 확인되면 이메일로 다운로드 링크를 보내드립니다.
                처리까지 다소 시간이 걸릴 수 있습니다.
              </p>
              <button
                onClick={() => startPolling(email)}
                className="mt-8 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors"
              >
                <RotateCcw size={12} /> 다시 확인
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function DownloadCard({
  item,
  index,
}: {
  item: DownloadItem
  index: number
}) {
  return (
    <div
      className="group border border-border hover:border-border-hover bg-bg-deep/40 transition-colors"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-stretch">

        {/* Accent stripe */}
        <div className="w-0.5 bg-accent shrink-0 self-stretch" />

        {/* Thumbnail */}
        {item.productImage && (
          <div className="w-20 h-20 sm:w-28 sm:h-28 shrink-0 overflow-hidden self-stretch">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.productImage}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 px-5 py-5">

          {/* Product name */}
          <p className="font-display font-extrabold text-lg leading-tight truncate mb-3 tracking-tight">
            {item.productName}
          </p>

          {/* Dashed divider */}
          <div className="border-t border-dashed border-border mb-3" />

          {/* Meta row */}
          <div className="flex items-end justify-between gap-4">
            <MetaField label="구매일" value={fmt(item.purchasedAt)} shortValue={fmtShort(item.purchasedAt)} />
            <MetaField label="만료일" value={fmt(item.expiresAt)} shortValue={fmtShort(item.expiresAt)} align="right" />
          </div>
        </div>

        {/* Arrow link */}
        <div className="flex items-center px-5 shrink-0 border-l border-border">
          <Link
            href={`/download/${item.token}`}
            className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-accent transition-colors"
            aria-label="다운로드 페이지로 이동"
          >
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  )
}

function MetaField({ label, value, shortValue, align = 'left' }: {
  label: string
  value: string
  shortValue?: string
  align?: 'left' | 'right'
}) {
  return (
    <div className={align === 'right' ? 'text-right' : ''}>
      <span className="font-mono text-[9px] uppercase tracking-widest text-text-muted block mb-0.5">
        {label}
      </span>
      <span className="font-mono text-xs text-text-primary">
        <span className="hidden sm:inline">{value}</span>
        <span className="sm:hidden">{shortValue ?? value}</span>
      </span>
    </div>
  )
}
