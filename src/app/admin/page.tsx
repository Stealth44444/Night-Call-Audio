'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  TrendingUp, Activity, ShoppingCart, AlertCircle,
  Plus, ArrowRight, RefreshCw, Package,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Analytics {
  totalRevenue: number
  monthRevenue: number
  aov: number
  totalOrders: number
  pendingCount: number
  trend30: { date: string; revenue: number }[]
  topProducts: { name: string; count: number; revenue: number }[]
  categoryBreakdown: { name: string; count: number; revenue: number }[]
  avgWaitHours: number
}

// ─── Animated counter ────────────────────────────────────────────────────────

function Counter({ value, fmt }: { value: number; fmt: (v: number) => string }) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    startRef.current = null
    const duration = 900
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts
      const t = Math.min((ts - startRef.current) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(value * ease))
      if (t < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [value])

  return <>{fmt(display)}</>
}

// ─── SVG line chart ──────────────────────────────────────────────────────────

function LineChart({ data, period }: { data: { date: string; revenue: number }[]; period: '7d' | '30d' }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const slice = period === '7d' ? data.slice(-7) : data
  const W = 700, H = 148
  const PL = 8, PR = 8, PT = 8, PB = 24

  const maxVal = Math.max(...slice.map(d => d.revenue), 1)
  const px = (i: number) => PL + (slice.length > 1 ? i / (slice.length - 1) : 0.5) * (W - PL - PR)
  const py = (v: number) => PT + (1 - v / maxVal) * (H - PT - PB)

  const pts = slice.map((d, i) => ({ x: px(i), y: py(d.revenue) }))
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')
  const areaPath = `${linePath} L ${pts[pts.length - 1]?.x ?? PL} ${H - PB} L ${pts[0]?.x ?? PL} ${H - PB} Z`

  const shortDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect || !slice.length) return
    const relX = ((e.clientX - rect.left) / rect.width) * W
    let best = 0
    let bestDist = Infinity
    pts.forEach(({ x }, i) => {
      const d = Math.abs(x - relX)
      if (d < bestDist) { bestDist = d; best = i }
    })
    setHoverIdx(best)
  }

  const hovered = hoverIdx !== null ? slice[hoverIdx] : null

  return (
    <div className="relative select-none">
      {/* Tooltip */}
      {hoverIdx !== null && hovered && (
        <div
          className="absolute top-0 pointer-events-none z-10 border border-border bg-bg-deep px-3 py-1.5 text-xs font-mono whitespace-nowrap"
          style={{
            left: `${(pts[hoverIdx].x / W) * 100}%`,
            transform: hoverIdx > slice.length * 0.65 ? 'translate(-100%, 4px)' : 'translate(8px, 4px)',
          }}
        >
          <span className="text-text-muted">{shortDate(hovered.date)}</span>
          <span className="ml-2 text-accent font-bold">
            ₩{hovered.revenue.toLocaleString('ko-KR')}
          </span>
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ cursor: 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4890A" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#D4890A" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map(f => (
          <line key={f}
            x1={PL} y1={py(maxVal * f)} x2={W - PR} y2={py(maxVal * f)}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1"
          />
        ))}

        {/* Date labels */}
        {slice.map((d, i) => {
          const step = period === '7d' ? 1 : 5
          if (i % step !== 0 && i !== slice.length - 1) return null
          return (
            <text key={d.date}
              x={px(i)} y={H - 2}
              textAnchor="middle" fontSize="9"
              fill="rgba(255,255,255,0.18)"
              fontFamily="monospace"
            >
              {shortDate(d.date)}
            </text>
          )
        })}

        {/* Area fill */}
        {pts.length > 1 && <path d={areaPath} fill="url(#chartFill)" />}

        {/* Line */}
        {pts.length > 1 && (
          <path d={linePath} fill="none" stroke="#D4890A" strokeWidth="1.5" strokeLinejoin="round" />
        )}

        {/* Hover indicator */}
        {hoverIdx !== null && pts[hoverIdx] && (
          <>
            <line
              x1={pts[hoverIdx].x} y1={PT}
              x2={pts[hoverIdx].x} y2={H - PB}
              stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 3"
            />
            <circle cx={pts[hoverIdx].x} cy={pts[hoverIdx].y} r="5" fill="#D4890A" fillOpacity="0.2" />
            <circle cx={pts[hoverIdx].x} cy={pts[hoverIdx].y} r="3" fill="#D4890A" />
          </>
        )}
      </svg>
    </div>
  )
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'7d' | '30d'>('30d')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/analytics')
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const fmtKrw = (v: number) => `₩${v.toLocaleString('ko-KR')}`
  const fmtCount = (v: number) => `${v}건`

  const metrics = data
    ? [
        {
          key: 'total',
          sublabel: 'Total Revenue',
          label: '누적 매출',
          value: data.totalRevenue,
          fmt: fmtKrw,
          icon: TrendingUp,
          color: 'text-accent-bright',
        },
        {
          key: 'month',
          sublabel: 'Month to Date',
          label: '이번 달',
          value: data.monthRevenue,
          fmt: fmtKrw,
          icon: Activity,
          color: 'text-text-primary',
        },
        {
          key: 'aov',
          sublabel: 'Avg. Order Value',
          label: '평균 주문액',
          value: data.aov,
          fmt: fmtKrw,
          icon: ShoppingCart,
          color: 'text-text-primary',
        },
        {
          key: 'pending',
          sublabel: 'Pending Approval',
          label: '승인 대기',
          value: data.pendingCount,
          fmt: fmtCount,
          icon: AlertCircle,
          color: data.pendingCount > 0 ? 'text-amber-300' : 'text-text-primary',
          urgent: data.pendingCount > 0,
          href: '/admin/orders',
        },
      ]
    : []

  const maxTopCount = data?.topProducts[0]?.count ?? 1
  const maxCatRevenue = Math.max(...(data?.categoryBreakdown.map(c => c.revenue) ?? [1]), 1)

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted mb-0.5">Night Call Audio</p>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-text-primary tracking-tight">
            Dashboard
          </h1>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-2.5 border border-border hover:border-border-hover text-text-muted hover:text-text-primary rounded-xl transition-all disabled:opacity-30"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading && !data ? (
        <div className="py-24 flex items-center justify-center gap-3 text-text-muted">
          <RefreshCw size={14} className="animate-spin" />
          <span className="font-mono text-xs tracking-wider">데이터 로드 중...</span>
        </div>
      ) : data ? (
        <>
          {/* ── Metric cards ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {metrics.map((m, i) => {
              const Icon = m.icon
              const inner = (
                <div
                  className={`p-5 border transition-all ${
                    m.urgent
                      ? 'bg-amber-500/5 border-amber-500/25 hover:border-amber-500/50'
                      : 'bg-bg-elevated/30 border-border hover:border-border-hover'
                  }`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-text-muted leading-none">
                        {m.sublabel}
                      </p>
                      <p className={`text-[11px] font-semibold mt-1 ${m.urgent ? 'text-amber-400' : 'text-text-muted'}`}>
                        {m.label}
                      </p>
                    </div>
                    <Icon size={13} className={m.urgent ? 'text-amber-400' : 'text-text-muted/50'} />
                  </div>
                  <p className={`font-display font-extrabold text-xl sm:text-2xl leading-none tracking-tight ${m.color}`}>
                    <Counter value={m.value} fmt={m.fmt} />
                  </p>
                </div>
              )

              return m.href ? (
                <Link key={m.key} href={m.href}>{inner}</Link>
              ) : (
                <div key={m.key}>{inner}</div>
              )
            })}
          </div>

          {/* ── Revenue trend ─────────────────────────────────────────────── */}
          <div className="border border-border bg-bg-elevated/20 p-5 sm:p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted mb-1">Sales Trend</p>
                <p className="font-display font-bold text-base sm:text-lg text-text-primary">매출 추이</p>
              </div>
              <div className="flex border border-border overflow-hidden shrink-0">
                {(['7d', '30d'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                      period === p
                        ? 'bg-accent text-bg-deep'
                        : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <LineChart data={data.trend30} period={period} />
          </div>

          {/* ── Bottom grid ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-2.5">

            {/* Top products */}
            <div className="lg:col-span-3 border border-border bg-bg-elevated/20 p-5 sm:p-6">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted mb-1">Best Sellers</p>
              <p className="font-display font-bold text-base sm:text-lg text-text-primary mb-6">
                베스트셀러 TOP {data.topProducts.length}
              </p>

              {data.topProducts.length === 0 ? (
                <div className="flex flex-col items-center py-8 gap-3">
                  <Package size={28} className="text-text-muted/20" />
                  <p className="text-xs text-text-muted">판매 데이터가 없습니다</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {data.topProducts.map((p, i) => (
                    <div key={p.name}>
                      <div className="flex items-baseline justify-between mb-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-mono text-[10px] text-text-muted/50 shrink-0 w-3">{i + 1}</span>
                          <span className="font-display font-bold text-sm text-text-primary truncate">{p.name}</span>
                        </div>
                        <div className="flex items-baseline gap-3 shrink-0 ml-4">
                          <span className="font-mono text-[10px] text-text-muted">{p.count}건</span>
                          <span className="font-display font-bold text-sm text-accent-bright whitespace-nowrap">
                            ₩{p.revenue.toLocaleString('ko-KR')}
                          </span>
                        </div>
                      </div>
                      <div className="h-px bg-border overflow-hidden">
                        <div
                          className="h-full bg-accent transition-all duration-700 ease-out delay-300"
                          style={{ width: `${(p.count / maxTopCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="lg:col-span-2 flex flex-col gap-2.5">

              {/* Category breakdown */}
              <div className="border border-border bg-bg-elevated/20 p-5 sm:p-6 flex-1">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted mb-1">Category</p>
                <p className="font-display font-bold text-base text-text-primary mb-5">카테고리별 매출</p>

                {data.categoryBreakdown.length === 0 ? (
                  <p className="text-xs text-text-muted italic">데이터 없음</p>
                ) : (
                  <div className="space-y-5">
                    {data.categoryBreakdown.map(c => (
                      <div key={c.name}>
                        <div className="flex items-baseline justify-between mb-1.5">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-text-secondary">{c.name}</span>
                          <span className="font-mono text-[10px] text-text-muted">{c.count}건</span>
                        </div>
                        <div className="h-0.5 bg-border overflow-hidden mb-1">
                          <div
                            className="h-full bg-gradient-to-r from-accent to-accent-bright transition-all duration-700 ease-out delay-500"
                            style={{ width: `${(c.revenue / maxCatRevenue) * 100}%` }}
                          />
                        </div>
                        <p className="font-display font-bold text-sm text-text-primary">
                          ₩{c.revenue.toLocaleString('ko-KR')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Operational stats */}
              <div className="border border-border bg-bg-elevated/20 p-5 sm:p-6">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted mb-4">Operational</p>
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-text-secondary">평균 승인 대기</span>
                    <span className="font-mono text-sm font-bold text-text-primary tabular-nums">
                      {data.avgWaitHours === 0
                        ? '—'
                        : data.avgWaitHours < 1
                        ? `${Math.round(data.avgWaitHours * 60)}분`
                        : `${data.avgWaitHours.toFixed(1)}h`}
                    </span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-text-secondary">총 완료 주문</span>
                    <span className="font-mono text-sm font-bold text-text-primary tabular-nums">
                      {data.totalOrders}건
                    </span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-text-secondary">미확인 입금</span>
                    <span className={`font-mono text-sm font-bold tabular-nums ${
                      data.pendingCount > 0 ? 'text-amber-400' : 'text-text-muted'
                    }`}>
                      {data.pendingCount > 0 ? `${data.pendingCount}건 ⚠` : '없음'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ── Quick actions ─────────────────────────────────────────────── */}
          <div className="border border-border bg-bg-elevated/20 p-5 sm:p-6">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted mb-4">Quick Actions</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-bg-deep font-bold hover:bg-accent-bright transition-all btn-glow text-xs tracking-wider uppercase"
              >
                <Plus size={13} /> 새 제품 등록
              </Link>
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-border hover:border-border-hover text-text-secondary hover:text-text-primary transition-all text-xs tracking-wider uppercase"
              >
                승인 대기 확인 <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
