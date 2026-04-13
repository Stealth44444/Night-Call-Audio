'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/cartStore'
import type { Product } from '@/lib/products'
import { Check, ArrowLeft, Sliders, Music } from 'lucide-react'
import { getPublicUrl } from '@/lib/storage'
import StarRating from './StarRating'

export default function ProductDetail({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const addItem = useCart(s => s.addItem)

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image_url: getPublicUrl(product.image_url),
      shopifyVariantId: product.shopify_variant_id,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const Icon = product.category === 'plugin' ? Sliders : Music

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Back link */}
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-10">
        <ArrowLeft size={16} />
        상점으로 돌아가기
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:items-center">
        {/* Visual */}
        {product.image_url ? (
          <div className="relative aspect-square rounded-2xl overflow-hidden">
            <Image 
              src={getPublicUrl(product.image_url) || ''} 
              alt={product.name} 
              fill 
              className="object-cover" 
            />
          </div>
        ) : (
          <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-[#764105]/30 via-[#1818E7]/15 to-[#FF299B]/10 flex items-center justify-center overflow-hidden glass">
            <Icon size={120} className="text-text-primary/8" strokeWidth={0.8} />
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-accent/5" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-nca-blue/5" />
            <div className="absolute top-8 left-8">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-accent bg-bg-deep/60 px-3 py-1 rounded-full">
                {product.category}
              </span>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="flex flex-col gap-12 lg:mt-12">
          {/* Top Content */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-accent mb-3 block">{product.category}</span>
              <h1 className="font-display font-extrabold text-4xl md:text-5xl leading-tight">{product.name}</h1>
            </div>

            <div>
              <div className="mb-3">
                <StarRating rating={4.9} size="md" showCount count={128} />
              </div>
              <p className="font-display font-extrabold text-4xl text-accent-bright">${product.price}</p>
            </div>

            <p className="text-text-secondary leading-relaxed text-base whitespace-pre-line break-keep">{product.description}</p>
          </div>

          {/* Bottom Content */}
          <div className="space-y-4">
            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-text-muted font-medium">수량</span>
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                >
                  -
                </button>
                <span className="w-12 h-10 flex items-center justify-center font-mono text-sm border-x border-border">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => Math.min(10, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className={`w-full py-4 rounded-full font-bold text-lg transition-all duration-300 btn-glow relative z-10 ${
                added
                  ? 'bg-emerald-500 text-white'
                  : 'bg-accent text-bg-deep hover:bg-accent-bright'
              }`}
            >
              {added ? (
                <span className="flex items-center justify-center gap-2">
                  <Check size={20} /> 장바구니에 담겼습니다
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
