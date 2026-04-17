'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cartStore'
import type { Product } from '@/lib/products'
import { Check, ArrowLeft, Sliders, Music } from 'lucide-react'
import { getPublicUrl } from '@/lib/storage'

export default function ProductDetail({ product }: { product: Product }) {
  const [added, setAdded] = useState(false)
  const [ratingData, setRatingData] = useState<{ average: number; count: number } | null>(null)
  const addItem = useCart(s => s.addItem)
  const router = useRouter()

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image_url: getPublicUrl(product.image_url),
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image_url: getPublicUrl(product.image_url),
    })
    router.push('/cart')
  }

  useEffect(() => {
    fetch(`/api/reviews?productId=${product.id}`)
      .then(r => r.json())
      .then(d => {
        if (d.average !== null) setRatingData({ average: d.average, count: d.count })
      })
      .catch(() => {})
  }, [product.id])

  const Icon = product.category === 'plugin' ? Sliders : Music

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-5 sm:mb-8">
        <ArrowLeft size={16} />
        상점으로 돌아가기
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 lg:items-center">
        {/* Visual */}
        {product.image_url ? (
          <div className="relative aspect-square rounded-xl overflow-hidden max-w-xs mx-auto w-full lg:max-w-sm">
            <Image
              src={getPublicUrl(product.image_url) || ''}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="relative aspect-square rounded-xl bg-gradient-to-br from-[#764105]/30 via-[#1818E7]/15 to-[#FF299B]/10 flex items-center justify-center overflow-hidden glass max-w-xs mx-auto w-full lg:max-w-sm">
            <Icon size={64} className="text-text-primary/8 sm:text-[96px]" strokeWidth={0.8} />
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-accent/5" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-nca-blue/5" />
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-accent bg-bg-deep/60 px-3 py-1 rounded-full">
                {product.category}
              </span>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="flex flex-col gap-5 sm:gap-8 lg:mt-8">
          <div className="space-y-3 sm:space-y-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-accent mb-2 block">{product.category}</span>
              <h1 className="font-display font-extrabold text-xl sm:text-3xl md:text-4xl leading-tight">{product.name}</h1>
              {ratingData && (
                <div className="flex items-center gap-1 mt-2">
                  <div className="flex items-center gap-px">
                    {[1,2,3,4,5].map(i => (
                      <span key={i} className={`text-[10px] ${i <= Math.round(ratingData.average) ? 'text-[#c8922a]/60' : 'text-text-muted/20'}`}>★</span>
                    ))}
                  </div>
                  <span className="font-mono text-[10px] text-text-muted/60 tracking-wide">{ratingData.average.toFixed(1)}</span>
                  <span className="font-mono text-[10px] text-text-muted/40">({ratingData.count})</span>
                </div>
              )}
            </div>

            <div>
              <p className="font-display font-extrabold text-xl sm:text-3xl text-accent-bright tracking-tight whitespace-nowrap">
                ₩{Number(product.price).toLocaleString('ko-KR')}
              </p>
            </div>

            <p className="text-text-secondary leading-relaxed text-xs sm:text-sm whitespace-pre-line break-keep">{product.description}</p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={handleBuyNow}
              className="w-full py-3 sm:py-3.5 rounded-full font-bold text-sm sm:text-base transition-all duration-300 btn-glow relative z-10 bg-accent text-bg-deep hover:bg-accent-bright"
            >
              바로 구매하기
            </button>
            <button
              onClick={handleAddToCart}
              className={`w-full py-3 sm:py-3.5 rounded-full font-bold text-sm sm:text-base transition-all duration-300 border relative z-10 ${
                added
                  ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10'
                  : 'border-border hover:border-border-hover text-text-primary hover:bg-bg-elevated'
              }`}
            >
              {added ? (
                <span className="flex items-center justify-center gap-2">
                  <Check size={16} /> 장바구니에 담겼습니다
                </span>
              ) : (
                '장바구니에 담기'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
