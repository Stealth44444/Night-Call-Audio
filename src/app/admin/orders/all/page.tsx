'use client'

import { useEffect, useState, useCallback } from 'react'
import { Loader2, ShoppingCart, RefreshCw, Trash2, Clock, Download } from 'lucide-react'

interface Order {
  id: string
  email: string
  productName: string
  totalPrice: number
  paymentMethod: string | null
  status: string
  createdAt: string
  tokenExpiresAt: string | null
}

type Filter = 'all' | 'pending' | 'completed'

function paymentLabel(method: string | null) {
  if (method === 'bank_transfer') return '무통장입금'
  if (method === 'kakao_pay') return '카카오페이'
  return '—'
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString('ko-KR', {
    month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtExpiry(iso: string | null) {
  if (!iso) return null
  const d = new Date(iso)
  const expired = d < new Date()
  return {
    label: d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    expired,
  }
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
        <div className="w-1 h-1 rounded-full bg-green-400" />
        완료
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
      <div className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
      대기중
    </span>
  )
}

function DeleteControl({ onDelete, loading }: { onDelete: () => void; loading: boolean }) {
  const [confirm, setConfirm] = useState(false)

  if (loading) return <Loader2 size={15} className="animate-spin text-text-muted" />

  if (confirm) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => { onDelete(); setConfirm(false) }}
          className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-all"
        >
          삭제
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-bg-elevated border border-border text-text-muted hover:text-text-primary transition-all"
        >
          취소
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
      title="주문 삭제"
    >
      <Trash2 size={15} />
    </button>
  )
}

function ExtendButton({
  orderId,
  expiresAt,
  onExtended,
}: {
  orderId: string
  expiresAt: string | null
  onExtended: (newExpiry: string) => void
}) {
  const [loading, setLoading] = useState(false)
  const expiry = fmtExpiry(expiresAt)

  const handleExtend = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/extend-token`, { method: 'PATCH' })
      if (res.ok) {
        const data = await res.json()
        onExtended(data.expiresAt)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!expiresAt) return <span className="text-[11px] text-text-muted">—</span>

  return (
    <div className="flex items-center gap-2">
      <span className={`text-[11px] font-mono ${expiry?.expired ? 'text-red-400' : 'text-text-muted'}`}>
        {expiry?.expired ? '만료 ' : ''}{expiry?.label}
      </span>
      <button
        onClick={handleExtend}
        disabled={loading}
        className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-bg-elevated border border-border text-text-muted hover:text-accent hover:border-accent/40 transition-all disabled:opacity-40"
        title="+7일 연장"
      >
        {loading ? <Loader2 size={10} className="animate-spin" /> : <Clock size={10} />}
        +7일
      </button>
    </div>
  )
}

function exportCSV(orders: Order[]) {
  const header = ['주문ID', '고객 이메일', '상품명', '금액', '결제수단', '상태', '주문일시', '다운로드 만료일']
  const rows = orders.map(o => [
    o.id,
    o.email,
    o.productName,
    o.totalPrice.toString(),
    paymentLabel(o.paymentMethod),
    o.status === 'completed' ? '완료' : '대기중',
    new Date(o.createdAt).toLocaleString('ko-KR'),
    o.tokenExpiresAt ? new Date(o.tokenExpiresAt).toLocaleString('ko-KR') : '',
  ])

  const csv = [header, ...rows]
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const bom = '\uFEFF' // Excel UTF-8 BOM
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `nca-orders-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminOrdersAllPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/orders/all')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setOrders(Array.isArray(data.orders) ? data.orders : [])
    } catch (err) {
      console.error('[all-orders] fetch failed:', err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' })
      if (res.ok) setOrders(prev => prev.filter(o => o.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  const handleExtended = (orderId: string, newExpiry: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, tokenExpiresAt: newExpiry } : o))
  }

  const filtered = orders.filter(o => {
    if (filter === 'all') return true
    if (filter === 'pending') return o.status === 'pending'
    return o.status === 'completed'
  })

  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    completed: orders.filter(o => o.status === 'completed').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-text-primary">전체 주문</h1>
          <p className="text-sm text-text-secondary mt-1">모든 주문 내역</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCSV(filtered)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text-primary border border-border rounded-xl hover:border-border-hover transition-all"
            title="CSV 내보내기"
          >
            <Download size={14} />
            <span className="hidden sm:inline">CSV 내보내기</span>
          </button>
          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text-primary border border-border rounded-xl hover:border-border-hover transition-all"
          >
            <RefreshCw size={14} />
            <span className="hidden sm:inline">새로고침</span>
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-border">
        {(['all', 'pending', 'completed'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-px ${
              filter === f
                ? 'border-accent text-accent'
                : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            {f === 'all' ? '전체' : f === 'pending' ? '대기중' : '완료'}
            <span className="ml-1.5 font-mono text-[10px] opacity-60">{counts[f]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-text-muted glass rounded-2xl border border-border">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">불러오는 중...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-4 glass rounded-2xl border border-border">
          <ShoppingCart size={40} className="text-text-muted/20" />
          <p className="text-sm text-text-muted">주문이 없습니다.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block glass rounded-2xl overflow-hidden border border-border">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-elevated/50 border-b border-border">
                  <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">상태</th>
                  <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">고객</th>
                  <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">상품</th>
                  <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">금액</th>
                  <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">결제</th>
                  <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">주문일시</th>
                  <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">다운로드 만료</th>
                  <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">삭제</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(order => (
                  <tr key={order.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-5 py-4 font-mono text-sm text-text-primary whitespace-nowrap">{order.email}</td>
                    <td className="px-5 py-4 text-sm text-text-secondary max-w-[180px] truncate">{order.productName}</td>
                    <td className="px-5 py-4 font-display font-bold text-accent-bright whitespace-nowrap">
                      ₩{order.totalPrice.toLocaleString('ko-KR')}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-bg-elevated border border-border text-text-secondary whitespace-nowrap">
                        {paymentLabel(order.paymentMethod)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-text-muted whitespace-nowrap font-mono">{fmt(order.createdAt)}</td>
                    <td className="px-5 py-4">
                      {order.status === 'completed' ? (
                        <ExtendButton
                          orderId={order.id}
                          expiresAt={order.tokenExpiresAt}
                          onExtended={(exp) => handleExtended(order.id, exp)}
                        />
                      ) : (
                        <span className="text-[11px] text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <DeleteControl
                        loading={deletingId === order.id}
                        onDelete={() => handleDelete(order.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {filtered.map(order => (
              <div key={order.id} className="glass rounded-2xl border border-border p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm text-text-primary truncate">{order.email}</p>
                    <p className="text-xs text-text-secondary mt-0.5 truncate">{order.productName}</p>
                  </div>
                  <span className="font-display font-bold text-accent-bright whitespace-nowrap text-sm shrink-0">
                    ₩{order.totalPrice.toLocaleString('ko-KR')}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={order.status} />
                    <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-bg-elevated border border-border text-text-secondary">
                      {paymentLabel(order.paymentMethod)}
                    </span>
                    <span className="text-[11px] text-text-muted font-mono">{fmt(order.createdAt)}</span>
                  </div>
                  <div className="shrink-0">
                    <DeleteControl
                      loading={deletingId === order.id}
                      onDelete={() => handleDelete(order.id)}
                    />
                  </div>
                </div>

                {order.status === 'completed' && (
                  <div className="pt-1 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">다운로드 만료</span>
                      <ExtendButton
                        orderId={order.id}
                        expiresAt={order.tokenExpiresAt}
                        onExtended={(exp) => handleExtended(order.id, exp)}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
