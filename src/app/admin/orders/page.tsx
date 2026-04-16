'use client'

import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, Loader2, ShoppingCart, RefreshCw } from 'lucide-react'

interface Order {
  id: string
  email: string
  productName: string
  totalPrice: number
  paymentMethod: string | null
  createdAt: string
}

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ id: string; text: string; ok: boolean } | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/orders')
      if (!res.ok) throw new Error('Failed to fetch orders')
      const data = await res.json()
      setOrders(Array.isArray(data.orders) ? data.orders : [])
    } catch (err) {
      console.error('[orders] Failed to fetch:', err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleApprove = async (id: string) => {
    setApprovingId(id)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/orders/${id}/approve`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setMessage({ id, text: '승인 완료 — 이메일 발송됨', ok: true })
        setOrders(prev => prev.filter(o => o.id !== id))
        setTimeout(() => setMessage(null), 4000)
      } else {
        setMessage({ id, text: data.error ?? '오류 발생', ok: false })
      }
    } catch {
      setMessage({ id, text: '네트워크 오류', ok: false })
    } finally {
      setApprovingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-text-primary">승인 대기</h1>
          <p className="text-sm text-text-secondary mt-1">입금 확인 후 승인하면 고객에게 이메일이 발송됩니다</p>
        </div>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text-primary border border-border rounded-xl hover:border-border-hover transition-all"
        >
          <RefreshCw size={14} />
          <span className="hidden sm:inline">새로고침</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-text-muted glass rounded-2xl border border-border">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">불러오는 중...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-4 glass rounded-2xl border border-border">
          <ShoppingCart size={40} className="text-text-muted/20" />
          <p className="text-sm text-text-muted">대기 중인 주문이 없습니다.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block glass rounded-2xl overflow-hidden border border-border">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-elevated/50 border-b border-border">
                  <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">고객</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">상품</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">금액</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">결제</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">주문 시각</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">승인</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map(order => (
                  <tr key={order.id} className="group hover:bg-white/[0.02] transition-colors">
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
                      {message?.id === order.id ? (
                        <span className={`text-xs font-mono ${message.ok ? 'text-green-400' : 'text-red-400'}`}>
                          {message.text}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApprove(order.id)}
                          disabled={approvingId === order.id}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-bg-deep font-bold rounded-lg hover:bg-accent-bright transition-all btn-glow text-xs disabled:opacity-50"
                        >
                          {approvingId === order.id
                            ? <Loader2 size={14} className="animate-spin" />
                            : <CheckCircle size={14} />
                          }
                          승인
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {orders.map(order => (
              <div key={order.id} className="glass rounded-2xl border border-border p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm text-text-primary truncate">{order.email}</p>
                    <p className="text-xs text-text-secondary mt-0.5 truncate">{order.productName}</p>
                  </div>
                  <span className="font-display font-bold text-accent-bright whitespace-nowrap text-sm shrink-0">
                    ₩{order.totalPrice.toLocaleString('ko-KR')}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-bg-elevated border border-border text-text-secondary">
                    {paymentLabel(order.paymentMethod)}
                  </span>
                  <span className="text-[11px] text-text-muted font-mono">{fmt(order.createdAt)}</span>
                </div>

                <div className="border-t border-border/50 pt-4">
                  {message?.id === order.id ? (
                    <span className={`text-xs font-mono ${message.ok ? 'text-green-400' : 'text-red-400'}`}>
                      {message.text}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApprove(order.id)}
                      disabled={approvingId === order.id}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent text-bg-deep font-bold rounded-xl hover:bg-accent-bright transition-all btn-glow text-xs disabled:opacity-50"
                    >
                      {approvingId === order.id
                        ? <Loader2 size={14} className="animate-spin" />
                        : <CheckCircle size={14} />
                      }
                      입금 확인 후 승인
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
