'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cartStore'
import type { Product } from '@/lib/products'
import { Check, ArrowLeft, Sliders, Music, Zap } from 'lucide-react'
import { getPublicUrl } from '@/lib/storage'
import StarRating from './StarRating'

export default function ProductDetail({ product }: { product: Product }) {
  const [added, setAdded] = useState(false)
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

  const Icon = product.category === 'plugin' ? Sliders : Music

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6 sm:mb-10">
        <ArrowLeft size={16} />
        상점으로 돌아가기
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 lg:items-center">
        {/* Visual */}
        {product.image_url ? (
          <div className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden max-w-sm mx-auto w-full lg:max-w-none">
            <Image
              src={getPublicUrl(product.image_url) || ''}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="relative aspect-square rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#764105]/30 via-[#1818E7]/15 to-[#FF299B]/10 flex items-center justify-center overflow-hidden glass max-w-sm mx-auto w-full lg:max-w-none">
            <Icon size={80} className="text-text-primary/8 sm:text-[120px]" strokeWidth={0.8} />
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-accent/5" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-nca-blue/5" />
            <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-accent bg-bg-deep/60 px-3 py-1 rounded-full">
                {product.category}
              </span>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="flex flex-col gap-6 sm:gap-12 lg:mt-12">
          <div className="space-y-4 sm:space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-accent mb-2 sm:mb-3 block">{product.category}</span>
              <h1 className="font-display font-extrabold text-2xl sm:text-4xl md:text-5xl leading-tight">{product.name}</h1>
            </div>

            <div>
              <p className="font-display font-extrabold text-2xl sm:text-4xl text-accent-bright tracking-tight whitespace-nowrap">
                ₩{Number(product.price).toLocaleString('ko-KR')}
              </p>
            </div>

            <p className="text-text-secondary leading-relaxed text-sm sm:text-base whitespace-pre-line break-keep">{product.description}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleBuyNow}
              className="w-full py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-lg transition-all duration-300 btn-glow relative z-10 bg-accent text-bg-deep hover:bg-accent-bright flex items-center justify-center gap-2"
            >
              <Zap size={18} />
              바로 구매하기
            </button>
            <button
              onClick={handleAddToCart}
              className={`w-full py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-lg transition-all duration-300 border relative z-10 ${
                added
                  ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10'
                  : 'border-border hover:border-border-hover text-text-primary hover:bg-bg-elevated'
              }`}
            >
              {added ? (
                <span className="flex items-center justify-center gap-2">
                  <Check size={18} /> 장바구니에 담겼습니다
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
