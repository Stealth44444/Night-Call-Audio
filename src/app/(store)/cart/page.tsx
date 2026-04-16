'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/lib/cartStore'
import { supabase } from '@/lib/supabase'
import { Trash2, ShoppingBag, ArrowLeft, Loader2, Copy, ExternalLink } from 'lucide-react'

type PaymentMethod = 'bank_transfer' | 'kakao_pay'

const BANK_NAME = process.env.NEXT_PUBLIC_BANK_NAME ?? ''
const BANK_NUMBER = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER ?? ''
const BANK_HOLDER = process.env.NEXT_PUBLIC_BANK_ACCOUNT_HOLDER ?? ''
const KAKAO_PAY_LINK = process.env.NEXT_PUBLIC_KAKAO_PAY_LINK ?? ''

export default function CartPage() {
  const { items, total, removeItem, clear } = useCart()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [copied, setCopied] = useState(false)

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(BANK_NUMBER)
    } catch {
      const el = document.createElement('textarea')
      el.value = BANK_NUMBER
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCheckout = async () => {
    if (!email) {
      setError('이메일 주소를 입력해 주세요')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('올바른 이메일 형식을 입력해 주세요')
      return
    }
    if (items.length === 0) {
      setError('장바구니가 비어있습니다')
      return
    }
    if (!paymentMethod) {
      setError('결제 수단을 선택해 주세요')
      return
    }

    setLoading(true)
    setError('')

    try {
      const normalizedEmail = email.toLowerCase().trim()

      // 1. Create orders in Supabase
      const orderInserts = items.map(item => ({
        product_id: item.productId,
        email: normalizedEmail,
        quantity: 1,
        total_price: item.price,
        status: 'pending',
        payment_method: paymentMethod,
      }))

      const { error: orderError } = await supabase.from('orders').insert(orderInserts)
      if (orderError) throw orderError

      localStorage.setItem('nca_email', normalizedEmail)

      // 2. Notify admin (fire-and-forget — failure doesn't block checkout)
      fetch('/api/orders/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: normalizedEmail,
          products: items.map(i => i.name),
          totalPrice: total(),
          paymentMethod,
          orderedAt: new Date().toISOString(),
        }),
      }).catch(() => {})

      clear()
      window.location.href = '/order-complete?new=1'
    } catch (err) {
      console.error(err)
      setError('주문 생성 중 오류가 발생했습니다. 다시 시도해 주세요.')
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
    <div className="max-w-5xl mx-auto px-4 sm:px-8 md:px-16 lg:px-20 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-10">
        <ArrowLeft size={16} /> 쇼핑 계속하기
      </Link>

      <h1 className="font-display font-bold text-3xl mb-10">Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Items */}
        <div className="lg:col-span-3 space-y-px">
          {items.map(item => (
            <div key={item.productId} className="group border border-border hover:border-border-hover bg-bg-deep/40 transition-colors">
              <div className="flex items-stretch">

                {/* Accent stripe */}
                <div className="w-0.5 bg-accent shrink-0 self-stretch" />

                {/* Thumbnail */}
                <div className="w-20 h-20 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center self-center ml-4 sm:ml-6">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      width={112}
                      height={112}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <ShoppingBag size={20} className="text-text-muted" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 px-5 py-5 sm:py-6">
                  <p className="font-display font-extrabold text-base sm:text-lg leading-tight line-clamp-2 mb-3 tracking-tight">
                    {item.name}
                  </p>
                  
                  {/* Dashed divider */}
                  <div className="border-t border-dashed border-border mb-3" />

                  {/* Price */}
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted block mb-0.5">Price</span>
                    <span className="font-display font-extrabold text-sm sm:text-base text-accent-bright">
                      ₩{item.price.toLocaleString('ko-KR')}
                    </span>
                  </div>
                </div>

                {/* Delete action */}
                <div className="flex items-center px-4 sm:px-6 shrink-0 border-l border-border">
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-24">
            {/* Card */}
            <div className="relative glass rounded-2xl overflow-hidden">
              {/* Top accent line */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

              <div className="p-6 space-y-5">

                {/* Header + Totals */}
                <div>
                  <div className="flex items-baseline justify-between mb-3">
                    <h2 className="font-display font-bold text-lg text-text-primary">주문 요약</h2>
                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-text-muted">Summary</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/40">
                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">소계</span>
                    <span className="text-sm font-medium text-text-secondary">₩{total().toLocaleString('ko-KR')}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3">
                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-text-muted">Total</span>
                    <span className="font-display font-extrabold text-xl text-accent-bright tracking-tight">
                      ₩{total().toLocaleString('ko-KR')}
                    </span>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono uppercase tracking-[0.2em] text-text-muted">
                    이메일 주소
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 bg-bg-deep/80 border border-border rounded-xl text-sm focus:outline-none focus:border-accent/60 focus:bg-bg-deep transition-all duration-200 placeholder:text-text-muted/40 font-mono tracking-wide"
                  />
                </div>

                {/* Payment method selector */}
                <div className="space-y-2">
                  <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-text-muted">결제 수단</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['bank_transfer', 'kakao_pay'] as PaymentMethod[]).map(method => {
                      const label = method === 'bank_transfer' ? '무통장입금' : '카카오페이'
                      const isSelected = paymentMethod === method
                      return (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`relative py-3 px-2 rounded-xl border transition-all duration-200 flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'border-accent/60 bg-accent/8 text-accent shadow-[0_0_12px_rgba(var(--accent-rgb,120,80,255),0.12)]'
                              : 'border-border bg-bg-deep/40 text-text-muted hover:border-border-hover hover:text-text-secondary hover:bg-bg-deep/60'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-200 ${isSelected ? 'bg-accent' : 'bg-border'}`} />
                          <span className="text-[10px] font-bold leading-tight text-center">
                            {label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Payment info panels */}
                {paymentMethod === 'bank_transfer' && (
                  <div className="rounded-xl border border-border/60 bg-bg-deep/60 overflow-hidden">
                    <div className="px-4 py-2 border-b border-border/40">
                      <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-text-muted">입금 계좌</span>
                    </div>
                    <div className="px-4 divide-y divide-border/30">
                      {[
                        { label: '은행', value: BANK_NAME },
                        { label: '예금주', value: BANK_HOLDER },
                      ].map(row => (
                        <div key={row.label} className="flex justify-between items-center py-2">
                          <span className="text-[10px] text-text-muted">{row.label}</span>
                          <span className="text-sm font-bold text-text-primary">{row.value}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center py-2">
                        <span className="text-[10px] text-text-muted">계좌번호</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-text-primary">{BANK_NUMBER}</span>
                          <button
                            onClick={copyAccount}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold transition-all duration-200 ${
                              copied
                                ? 'border-accent/50 bg-accent/10 text-accent'
                                : 'border-border text-text-muted hover:border-border-hover hover:text-text-primary'
                            }`}
                          >
                            <Copy size={9} />
                            {copied ? '복사됨' : '복사'}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-[10px] text-text-muted">입금 금액</span>
                        <span className="font-display font-extrabold text-sm text-accent-bright">₩{total().toLocaleString('ko-KR')}</span>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'kakao_pay' && (
                  <div className="rounded-xl border border-border/60 bg-bg-deep/60 overflow-hidden">
                    <div className="px-4 py-2 border-b border-border/40">
                      <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-text-muted">카카오페이 송금</span>
                    </div>
                    <div className="px-4 py-3 space-y-3">
                      <p className="text-xs text-text-secondary">
                        아래 버튼을 눌러 카카오페이로 송금해 주세요.{' '}
                        <span className="text-amber-400/80">※ 모바일 전용</span>
                      </p>
                      <a
                        href={KAKAO_PAY_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-bg-deep font-bold rounded-xl hover:bg-accent-bright transition-colors text-xs w-full justify-center tracking-wider uppercase"
                      >
                        <ExternalLink size={13} /> 송금하기 — ₩{total().toLocaleString('ko-KR')}
                      </a>
                    </div>
                  </div>
                )}


                {/* Error */}
                {error && (
                  <p className="text-red-400 text-xs font-mono px-1">{error}</p>
                )}

                {/* Checkout button */}
                <button
                  onClick={handleCheckout}
                  disabled={loading || !paymentMethod}
                  className="w-full py-4 bg-accent text-bg-deep font-bold rounded-xl hover:bg-accent-bright transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed btn-glow relative z-10 text-xs tracking-[0.15em] uppercase"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={14} className="animate-spin" /> 처리 중...
                    </span>
                  ) : (
                    '주문하기'
                  )}
                </button>

                {paymentMethod && (
                  <p className="text-[10px] text-text-muted text-center leading-relaxed pb-1">
                    주문 후 입금 확인까지 다소 시간이 걸릴 수 있습니다.
                  </p>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
