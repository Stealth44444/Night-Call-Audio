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
  if (method === 'toss') return '토스'
  return '—'
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
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display font-bold text-3xl text-text-primary">Orders</h1>
          <p className="text-sm text-text-secondary mt-1">입금 대기 중인 주문 목록</p>
        </div>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-text-muted hover:text-text-primary border border-border rounded-xl hover:border-border-hover transition-all"
        >
          <RefreshCw size={14} /> 새로고침
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden shadow-2xl border border-border">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-text-muted">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">불러오는 중...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <ShoppingCart size={48} className="text-text-muted/20" />
            <p className="text-sm text-text-muted italic">대기 중인 주문이 없습니다.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-elevated/50 border-b border-border">
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">고객</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">상품</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">금액</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">결제 수단</th>
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
                        {approvingId === order.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle size={14} />
                        )}
                        승인
                      </button>
                    )}
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
