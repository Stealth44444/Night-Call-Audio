'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from './ProductCard'

interface ProductCarouselProps {
  products: any[]
}

export default function ProductCarousel({ products }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.8
        : scrollLeft + clientWidth * 0.8
      
      scrollRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="relative">
      {/* Navigation Arrows (Desktop Only) - Positioned higher to clear the border line */}
      <div className="absolute -top-[104px] right-0 hidden md:flex items-center gap-2">
        <button
          onClick={() => scroll('left')}
          className="p-2 rounded-full border border-border bg-bg-surface/80 hover:bg-accent hover:border-accent hover:text-bg-deep transition-all duration-300 backdrop-blur-sm"
          aria-label="Scroll Left"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => scroll('right')}
          className="p-2 rounded-full border border-border bg-bg-surface/80 hover:bg-accent hover:border-accent hover:text-bg-deep transition-all duration-300 backdrop-blur-sm"
          aria-label="Scroll Right"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0"
      >
        {products.map((product) => (
          <div 
            key={product.id} 
            className="flex-shrink-0 w-[180px] sm:w-[220px] md:w-[240px] snap-start"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  )
}
