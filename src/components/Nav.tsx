'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/lib/cartStore'

export default function Nav() {
  const items = useCart(s => s.items)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="glass border-b border-border">
        <nav className="max-w-[1440px] mx-auto px-8 md:px-12 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3.5 group transition-all">
            <div className="relative w-10 h-10 group-hover:scale-110 transition-transform duration-500 ease-out">
              <Image 
                src="/nca_logo.svg" 
                alt="Logo" 
                fill 
                className="object-contain" 
              />
            </div>
            <span className="font-display font-extrabold text-xl tracking-tighter text-text-primary group-hover:text-accent transition-colors">
              Night Call Audio
            </span>
          </Link>



          <Link
            href="/cart"
            className="relative flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:border-border-hover hover:bg-bg-elevated transition-all text-sm"
          >
            <span>Cart</span>
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent text-bg-deep text-xs font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  )
}
