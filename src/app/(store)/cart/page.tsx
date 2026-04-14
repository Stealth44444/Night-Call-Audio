'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/lib/cartStore'
import { supabase } from '@/lib/supabase'
import { Trash2, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react'

export default function CartPage() {
  const { items, total, removeItem, updateQuantity, clear } = useCart()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleCheckout = async () => {
    if (!email) {
      setError('이메일 주소를 입력해 주세요')
      return
    }
    if (items.length === 0) {
      setError('장바구니가 비어있습니다')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 1. Supabase에 주문 생성
      const orderInserts = items.map(item => ({
        product_id: item.productId,
        email: email.toLowerCase().trim(),
        quantity: item.quantity,
        total_price: item.price * item.quantity,
        status: 'pending',
      }))

      const { error: orderError } = await supabase.from('orders').insert(orderInserts)
      if (orderError) throw orderError

      localStorage.setItem('nca_email', email.toLowerCase().trim())
      clear()

      // 2. 토스페이먼츠 결제 요청 (연동 시 활성화)
      // -------------------------------------------------------
      // const tossPayments = TossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!)
      // await tossPayments.requestPayment('카드', {
      //   amount: Math.round(total() * 1450),  // USD → KRW 환율 적용
      //   orderId: `NCA-${Date.now()}`,
      //   orderName: items.length === 1
      //     ? items[0].name
      //     : `${items[0].name} 외 ${items.length - 1}건`,
      //   customerEmail: email,
      //   successUrl: `${window.location.origin}/order-complete`,
      //   failUrl: `${window.location.origin}/cart`,
      // })
      // -------------------------------------------------------

      // 임시 패스: 토스 연동 전 결제 완료 시뮬레이션 (토스 연동 후 제거)
      await fetch('/api/checkout/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      })

      window.location.href = '/order-complete'
    } catch (err) {
      console.error(err)
      setError('결제 처리 중 오류가 발생했습니다. 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-bg-surface flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={32} className="text-text-muted" />
          </div>
          <h1 className="font-display font-bold text-2xl mb-3">Your cart is empty</h1>
          <p className="text-text-secondary mb-8">우리 컬렉션을 살펴보고 마음에 드는 제품을 찾아보세요.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-bg-deep font-bold rounded-full hover:bg-accent-bright transition-colors text-sm"
          >
            <ArrowLeft size={16} /> 쇼핑 계속하기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-10">
        <ArrowLeft size={16} /> 쇼핑 계속하기
      </Link>

      <h1 className="font-display font-bold text-3xl mb-10">Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Items */}
        <div className="lg:col-span-3 space-y-4">
          {items.map(item => (
            <div key={item.productId} className="glass rounded-xl p-5 flex gap-5 group">
              {item.image_url ? (
                <div className="w-20 h-20 shrink-0 relative">
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#764105]/30 to-[#1818E7]/20 flex items-center justify-center shrink-0">
                  <ShoppingBag size={20} className="text-text-muted" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-lg truncate">{item.name}</h3>
                <p className="text-sm text-text-secondary mt-0.5">개당 ₩{item.price.toLocaleString('ko-KR')}</p>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors text-sm"
                    >
                      -
                    </button>
                    <span className="w-10 h-8 flex items-center justify-center font-mono text-sm border-x border-border">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, Math.min(10, item.quantity + 1))}
                      className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors text-sm"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="ml-auto p-2 text-text-muted hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="font-display font-bold text-lg text-accent-bright whitespace-nowrap">₩{(item.price * item.quantity).toLocaleString('ko-KR')}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="glass rounded-xl p-8 sticky top-24">
            <h2 className="font-display font-bold text-lg mb-6">주문 요약</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">소계</span>
                <span className="font-medium">₩{total().toLocaleString('ko-KR')}</span>
              </div>
              <div className="border-t border-border my-4" />
              <div className="flex justify-between text-lg">
                <span className="font-bold">총합</span>
                <span className="font-display font-extrabold text-accent-bright">₩{total().toLocaleString('ko-KR')}</span>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">이메일 주소</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                className="w-full px-4 py-3 bg-bg-deep border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-text-muted"
              />
            </div>

            {error && (
              <p className="text-red-400 mt-3 text-xs">{error}</p>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full mt-6 py-3.5 bg-accent text-bg-deep font-bold rounded-xl hover:bg-accent-bright transition-colors disabled:opacity-50 btn-glow relative z-10 text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> 처리 중...
                </span>
              ) : (
                '결제하기'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
