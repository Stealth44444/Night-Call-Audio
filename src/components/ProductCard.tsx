import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/lib/products'
import { Sliders, Music } from 'lucide-react'
import { getPublicUrl } from '@/lib/storage'

const categoryLabels: Record<string, string> = {
  plugin:     '믹싱 플러그인',
  preset:     '프리셋',
  instrument: '가상 악기',
  sample:     '샘플 팩',
  bundle:     '번들',
}

const categoryGradients: Record<string, string> = {
  plugin: 'from-[#764105]/40 via-[#1818E7]/20 to-[#FF299B]/10',
  preset: 'from-[#1818E7]/40 via-[#FF299B]/20 to-[#764105]/10',
  instrument: 'from-[#FF299B]/30 via-[#1818E7]/30 to-[#764105]/10',
  sample: 'from-[#FF299B]/40 via-[#764105]/20 to-[#1818E7]/10',
  bundle: 'from-[#764105]/30 via-[#FF299B]/30 to-[#1818E7]/30',
}

export default function ProductCard({ product, rating }: { product: Product; rating?: { average: number; count: number } }) {
  const gradient = categoryGradients[product.category] || categoryGradients.preset
  const Icon = product.category === 'plugin' ? Sliders : Music

  return (
    <Link href={`/products/${product.id}`} className="block">
    <div className="relative flex flex-col h-full transition-all duration-500 group">
      {/* Image/Visual area */}
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
            <Icon size={64} className="text-text-primary/10 group-hover:text-text-primary/20 transition-colors duration-500" strokeWidth={1} />
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-accent/5 group-hover:bg-accent/10 transition-colors duration-700" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-nca-pink/5 group-hover:bg-nca-pink/10 transition-colors duration-700" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow text-center md:text-left px-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-accent/80 mb-1">{categoryLabels[product.category] ?? product.category}</span>
        
        <h3 className="font-display font-bold leading-tight text-base md:text-lg text-text-primary group-hover:text-accent transition-colors duration-300 line-clamp-2 mb-1.5">
          {product.name}
        </h3>
        {rating && (
          <div className="flex justify-center md:justify-start items-center gap-1 mb-1.5">
            <div className="flex items-center gap-px">
              {[1,2,3,4,5].map(i => (
                <span key={i} className={`text-[10px] ${i <= Math.round(rating.average) ? 'text-[#c8922a]/60' : 'text-text-muted/20'}`}>★</span>
              ))}
            </div>
            <span className="font-mono text-[10px] text-text-muted/60 tracking-wide">
              {rating.average.toFixed(1)}
            </span>
            <span className="font-mono text-[10px] text-text-muted/40">
              ({rating.count})
            </span>
          </div>
        )}
        <p className="mt-auto font-display font-bold text-accent-bright text-xl tracking-tight whitespace-nowrap">
          ₩{Number(product.price).toLocaleString('ko-KR')}
        </p>
      </div>
    </div>
    </Link>
  )
}
