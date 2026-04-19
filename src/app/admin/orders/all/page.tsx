'use client'

import { useEffect, useState, useCallback } from 'react'
import { Loader2, ShoppingCart, RefreshCw, Trash2, Clock, Download, X, ChevronRight } from 'lucide-react'

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

function fmtFull(iso: string) {
  return new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
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
      <span className="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-0.5 rounded-full bg-[#1a3a2a] whitespace-nowrap" style={{ boxShadow: 'inset 0 0 0 0.5px rgba(52,199,89,0.35)' }}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#34c759] shadow-[0_0_4px_rgba(52,199,89,0.7)] shrink-0" />
        <span className="text-[11px] font-medium text-[#34c759] tracking-normal">완료</span>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-0.5 rounded-full bg-[#3a2e10] whitespace-nowrap" style={{ boxShadow: 'inset 0 0 0 0.5px rgba(255,196,0,0.35)' }}>
      <span className="w-1.5 h-1.5 rounded-full bg-[#ffc400] shadow-[0_0_4px_rgba(255,196,0,0.6)] shrink-0 animate-pulse" />
      <span className="text-[11px] font-medium text-[#ffc400] tracking-normal">대기중</span>
    </span>
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

  const bom = '\uFEFF'
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `nca-orders-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function OrderDrawer({
  order,
  onClose,
  onDelete,
  onExtended,
  deleting,
}: {
  order: Order | null
  onClose: () => void
  onDelete: (id: string) => void
  onExtended: (id: string, newExpiry: string) => void
  deleting: boolean
}) {
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [extending, setExtending] = useState(false)

  useEffect(() => {
    setDeleteConfirm(false)
  }, [order?.id])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleExtend = async () => {
    if (!order) return
    setExtending(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/extend-token`, { method: 'PATCH' })
      if (res.ok) {
        const data = await res.json()
        onExtended(order.id, data.expiresAt)
      }
    } finally {
      setExtending(false)
    }
  }

  const expiry = order ? fmtExpiry(order.tokenExpiresAt) : null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${order ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-bg-deep border-l border-border flex flex-col transition-transform duration-300 ease-out ${order ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">주문 상세</span>
          <button onClick={onClose} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        {order && (
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Status + amount */}
            <div className="flex items-center justify-between">
              <StatusBadge status={order.status} />
              <span className="font-display font-bold text-xl text-accent-bright">
                ₩{order.totalPrice.toLocaleString('ko-KR')}
              </span>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <Field label="고객 이메일" value={order.email} mono />
              <Field label="상품명" value={order.productName} />
              <Field label="결제수단" value={paymentLabel(order.paymentMethod)} />
              <Field label="주문일시" value={fmtFull(order.createdAt)} mono />
              {order.tokenExpiresAt && (
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted block mb-1">다운로드 만료</span>
                  <span className={`font-mono text-sm ${expiry?.expired ? 'text-red-400' : 'text-text-primary'}`}>
                    {expiry?.expired ? '만료됨 · ' : ''}{fmtFull(order.tokenExpiresAt)}
                  </span>
                </div>
              )}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted block mb-1">주문 ID</span>
                <span className="font-mono text-[11px] text-text-muted break-all">{order.id}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2 border-t border-border">
              {order.status === 'completed' && order.tokenExpiresAt && (
                <button
                  onClick={handleExtend}
                  disabled={extending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-bg-elevated border border-border text-text-secondary hover:text-accent hover:border-accent/40 transition-all disabled:opacity-40"
                >
                  {extending ? <Loader2 size={13} className="animate-spin" /> : <Clock size={13} />}
                  다운로드 기간 +7일 연장
                </button>
              )}

              {!deleteConfirm ? (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-bg-elevated border border-border text-text-muted hover:text-red-400 hover:border-red-500/30 transition-all"
                >
                  <Trash2 size={13} />
                  주문 삭제
                </button>
              ) : (
                <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 space-y-3">
                  <p className="text-xs text-text-secondary">이 주문을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { onDelete(order.id); setDeleteConfirm(false) }}
                      disabled={deleting}
                      className="flex-1 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-all disabled:opacity-40"
                    >
                      {deleting ? <Loader2 size={12} className="animate-spin mx-auto" /> : '삭제 확인'}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      className="flex-1 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg bg-bg-elevated border border-border text-text-muted hover:text-text-primary transition-all"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted block mb-1">{label}</span>
      <span className={`text-sm text-text-primary ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}

export default function AdminOrdersAllPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

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
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== id))
        setSelectedOrder(null)
      }
    } finally {
      setDeletingId(null)
    }
  }

  const handleExtended = (orderId: string, newExpiry: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, tokenExpiresAt: newExpiry } : o))
    setSelectedOrder(prev => prev?.id === orderId ? { ...prev, tokenExpiresAt: newExpiry } : prev)
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
                  <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest w-6" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(order => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
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
                    <td className="px-5 py-4 text-right">
                      <ChevronRight size={14} className="text-text-muted/30 group-hover:text-text-muted transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {filtered.map(order => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="glass rounded-2xl border border-border p-5 space-y-3 cursor-pointer hover:border-border-hover transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm text-text-primary truncate">{order.email}</p>
                    <p className="text-xs text-text-secondary mt-0.5 truncate">{order.productName}</p>
                  </div>
                  <span className="font-display font-bold text-accent-bright whitespace-nowrap text-sm shrink-0">
                    ₩{order.totalPrice.toLocaleString('ko-KR')}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={order.status} />
                    <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-bg-elevated border border-border text-text-secondary">
                      {paymentLabel(order.paymentMethod)}
                    </span>
                    <span className="text-[11px] text-text-muted font-mono">{fmt(order.createdAt)}</span>
                  </div>
                  <ChevronRight size={14} className="text-text-muted/40 shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <OrderDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onDelete={handleDelete}
        onExtended={handleExtended}
        deleting={!!deletingId}
      />
    </div>
  )
}
