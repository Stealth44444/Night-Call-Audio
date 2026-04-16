'use client'

import { useEffect, useState, useRef } from 'react'
import { use } from 'react'
import { ArrowDownToLine, Clock, AlertTriangle, Loader2 } from 'lucide-react'
import FloatingAnimation from '@/components/FloatingAnimation'

type Status = 'loading' | 'ready' | 'downloading' | 'expired' | 'error'

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

export default function DownloadPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = use(params)
  const [status, setStatus] = useState<Status>('loading')
  const [productName, setProductName] = useState('')
  const [productImage, setProductImage] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState('')
  const [purchasedAt, setPurchasedAt] = useState('')
  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    fetch(`/api/download/${token}`)
      .then(async res => {
        const data = await res.json()
        if (res.ok) {
          setProductName(data.productName)
          setProductImage(data.productImage ?? null)
          setExpiresAt(data.expiresAt)
          setPurchasedAt(data.purchasedAt)
          setStatus('ready')
        } else if (data.error === 'expired') {
          setStatus('expired')
        } else {
          setStatus('error')
        }
      })
      .catch(() => setStatus('error'))
  }, [token])

  const handleDownload = async () => {
    setStatus('downloading')
    try {
      const res = await fetch(`/api/download/${token}`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        window.location.href = data.downloadUrl
        setTimeout(() => setStatus('ready'), 1500)
      } else if (data.error === 'expired') {
        setStatus('expired')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

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

      <div className="relative z-10 w-full max-w-2xl mx-auto px-6">

        {/* Label */}
        <p className="font-display font-bold text-[10px] uppercase tracking-[0.25em] text-accent mb-8">
          Night Call Audio
        </p>

        {/* Loading */}
        {status === 'loading' && (
          <div className="flex items-center gap-3 py-16">
            <Loader2 size={16} className="animate-spin text-accent" />
            <span className="font-mono text-sm text-text-secondary tracking-wide">불러오는 중...</span>
          </div>
        )}

        {/* PC 권장 안내 */}
        {(status === 'ready' || status === 'downloading') && (
          <div className="flex items-start gap-3 mb-5 px-4 py-3 border border-border/50 bg-bg-surface/30 rounded-none">
            <span className="text-accent text-xs mt-px shrink-0 font-mono">i</span>
            <p className="text-xs text-text-muted leading-relaxed">
              파일 다운로드는 <span className="text-text-secondary font-medium">PC 또는 노트북</span> 환경을 권장합니다. 모바일에서는 파일이 정상적으로 저장되지 않을 수 있습니다.
            </p>
          </div>
        )}

        {/* Ready / Downloading */}
        {(status === 'ready' || status === 'downloading') && (
          <div className="border border-border bg-bg-deep/40">

            {/* Top row: thumbnail + info + download btn */}
            <div className="flex items-stretch">
              {/* Accent stripe */}
              <div className="w-0.5 bg-accent shrink-0" />

              {/* Thumbnail */}
              {productImage && (
                <div className="w-16 h-16 sm:w-40 sm:h-40 shrink-0 flex items-center justify-center self-center ml-4 sm:ml-7">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={productImage} alt="" className="w-full h-full object-contain" />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0 px-4 sm:px-7 py-4 sm:py-6">
                <p className="font-display font-extrabold text-sm sm:text-2xl leading-tight tracking-tight mb-3 line-clamp-2">
                  {productName}
                </p>
                <div className="border-t border-dashed border-border mb-3" />
                <div className="flex items-end justify-between gap-3">
                  <MetaField label="구매일" value={purchasedAt ? fmt(purchasedAt) : '—'} shortValue={purchasedAt ? fmtShort(purchasedAt) : '—'} />
                  <MetaField label="만료일" value={expiresAt ? fmt(expiresAt) : '—'} shortValue={expiresAt ? fmtShort(expiresAt) : '—'} align="right" />
                </div>
              </div>

              {/* Download action */}
              <div className="flex items-center px-4 sm:px-7 shrink-0 border-l border-border">
                <button
                  onClick={handleDownload}
                  disabled={status === 'downloading'}
                  className="flex flex-col items-center gap-1.5 text-text-muted hover:text-accent disabled:opacity-40 transition-colors"
                >
                  {status === 'downloading'
                    ? <Loader2 size={20} className="animate-spin text-accent" />
                    : <ArrowDownToLine size={20} />
                  }
                  <span className="font-mono text-[9px] uppercase tracking-widest">
                    {status === 'downloading' ? '준비중' : '다운로드'}
                  </span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Expired */}
        {status === 'expired' && (
          <div className="border border-border bg-bg-deep/40">
            <div className="flex items-stretch">
              <div className="w-0.5 bg-amber-500 shrink-0" />
              <div className="px-7 py-8">
                <Clock size={20} className="text-amber-400 mb-4" />
                <p className="font-display font-extrabold text-xl tracking-tight mb-2">
                  링크가 만료되었습니다
                </p>
                <p className="font-mono text-xs text-text-muted leading-relaxed">
                  다운로드 기간이 종료되었습니다.<br />
                  문의가 필요하시면 이메일로 연락해주세요.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="border border-border bg-bg-deep/40">
            <div className="flex items-stretch">
              <div className="w-0.5 bg-red-500 shrink-0" />
              <div className="px-7 py-8">
                <AlertTriangle size={20} className="text-red-400 mb-4" />
                <p className="font-display font-extrabold text-xl tracking-tight mb-2">
                  유효하지 않은 링크
                </p>
                <p className="font-mono text-xs text-text-muted leading-relaxed">
                  올바른 다운로드 링크가 아닙니다.<br />
                  구매 내역은 내 구매 탭에서 확인할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 환불 정책 */}
        {(status === 'ready' || status === 'downloading' || status === 'expired') && (
          <div className="mt-8 border-t border-border pt-6 space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-3">
              구매 안내
            </p>
            <PolicyLine>
              디지털 음원 파일 특성상 다운로드 완료 후 환불이 불가합니다.
            </PolicyLine>
            <PolicyLine>
              다운로드 링크는 구매일로부터 7일간 유효하며, 기간 내 횟수 제한 없이 다운로드 가능합니다.
            </PolicyLine>
            <PolicyLine>
              링크 만료 후 재발급이 필요한 경우 구매 이메일로 문의해주세요.
            </PolicyLine>
            <PolicyLine>
              구매한 파일은 개인 제작물에만 사용 가능하며, 재배포·재판매·상업적 2차 저작물 제작은 금지됩니다.
            </PolicyLine>
          </div>
        )}

      </div>
    </div>
  )
}

function PolicyLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] text-text-muted leading-relaxed flex gap-2">
      <span className="text-border shrink-0 mt-px">—</span>
      <span>{children}</span>
    </p>
  )
}

function MetaField({
  label,
  value,
  shortValue,
  align = 'left',
}: {
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
