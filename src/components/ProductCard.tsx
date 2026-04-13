'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/lib/products'
import { Sliders, Music } from 'lucide-react'
import { getPublicUrl } from '@/lib/storage'
import StarRating from './StarRating'

const categoryGradients: Record<string, string> = {
  plugin: 'from-[#764105]/40 via-[#1818E7]/20 to-[#FF299B]/10',
  preset: 'from-[#1818E7]/40 via-[#FF299B]/20 to-[#764105]/10',
  sample: 'from-[#FF299B]/40 via-[#764105]/20 to-[#1818E7]/10',
  bundle: 'from-[#764105]/30 via-[#FF299B]/30 to-[#1818E7]/30',
}

export default function ProductCard({ product }: { product: Product }) {
  const gradient = categoryGradients[product.category] || categoryGradients.preset
  const Icon = product.category === 'plugin' ? Sliders : Music

  return (
    <Link href={`/products/${product.id}`} className="block group">
      <div className="relative flex flex-col h-full transition-all duration-500">
        {/* Image/Visual area - Larger and breathing */}
        <div className="relative aspect-square w-full mb-4 overflow-visible">
          {product.image_url ? (
            <div className="relative w-full h-full">
              <Image 
                src={getPublicUrl(product.image_url) || ''} 
                alt={product.name} 
                fill 
                className="object-contain transform group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-700 ease-out drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_30px_60px_rgba(212,137,10,0.2)]" 
              />
            </div>
          ) : (
            <div className={`relative w-full h-full rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden border border-white/5`}>
              <Icon
                size={64}
                className="text-text-primary/10 group-hover:text-text-primary/20 transition-colors duration-500"
                strokeWidth={1}
              />
              {/* Decorative circles */}
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-accent/5 group-hover:bg-accent/10 transition-colors duration-700" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-nca-pink/5 group-hover:bg-nca-pink/10 transition-colors duration-700" />
            </div>
          )}
        </div>

        {/* Content - Below the image */}
        <div className="flex flex-col text-center md:text-left px-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent/80">{product.category}</span>
            <span className="font-display font-extrabold text-accent-bright text-lg">
              ${product.price}
            </span>
          </div>

          <h3 className="font-display font-bold leading-tight text-lg md:text-xl text-text-primary group-hover:text-accent transition-colors duration-300">
            {product.name}
          </h3>

          <div className="mt-1.5">
            <StarRating rating={4.9} size="sm" />
          </div>

          <div className="mt-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
            <span className="text-[10px] text-accent font-bold uppercase tracking-tighter py-1 border-b border-accent/30">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
