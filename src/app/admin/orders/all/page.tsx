'use client'

import { useEffect, useState, useCallback } from 'react'
import { Loader2, ShoppingCart, RefreshCw, Trash2 } from 'lucide-react'

interface Order {
  id: string
  email: string
  productName: string
  totalPrice: number
  paymentMethod: string | null
  status: string
  createdAt: string
}

type Filter = 'all' | 'pending' | 'completed'

function paymentLabel(method: string | null) {
  if (method === 'bank_transfer') return '무통장입금'
  if (method === 'kakao_pay') return '카카오페이'
  if (method === 'toss') return '토스'
  return '—'
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

  const handleDelete = async (id: string, email: string) => {
    if (!window.confirm(`${email}의 주문을 삭제하시겠습니까?\n다운로드 토큰도 함께 삭제됩니다.`)) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== id))
      } else {
        const data = await res.json()
        alert(data.error ?? '삭제 중 오류가 발생했습니다.')
      }
    } catch {
      alert('네트워크 오류가 발생했습니다.')
    } finally {
      setDeletingId(null)
    }
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
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display font-bold text-3xl text-text-primary">All Orders</h1>
          <p className="text-sm text-text-secondary mt-1">전체 주문 내역</p>
        </div>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-text-muted hover:text-text-primary border border-border rounded-xl hover:border-border-hover transition-all"
        >
          <RefreshCw size={14} /> 새로고침
        </button>
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

      <div className="glass rounded-2xl overflow-hidden shadow-2xl border border-border">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-text-muted">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">불러오는 중...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <ShoppingCart size={48} className="text-text-muted/20" />
            <p className="text-sm text-text-muted italic">주문이 없습니다.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-elevated/50 border-b border-border">
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">상태</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">고객</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">상품</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">금액</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">결제 수단</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">주문 시각</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">삭제</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(order => (
                <tr key={order.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-5"><StatusBadge status={order.status} /></td>
                  <td className="px-6 py-5 font-mono text-sm text-text-primary">{order.email}</td>
                  <td className="px-6 py-5 text-sm text-text-secondary">{order.productName}</td>
                  <td className="px-6 py-5 font-display font-bold text-accent-bright whitespace-nowrap">
                    ₩{order.totalPrice.toLocaleString('ko-KR')}
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-bg-elevated border border-border text-text-secondary">
                      {paymentLabel(order.paymentMethod)}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-text-muted whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleString('ko-KR')}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button
                      onClick={() => handleDelete(order.id, order.email)}
                      disabled={deletingId === order.id}
                      className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-40"
                      title="주문 삭제"
                    >
                      {deletingId === order.id
                        ? <Loader2 size={15} className="animate-spin" />
                        : <Trash2 size={15} />
                      }
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
