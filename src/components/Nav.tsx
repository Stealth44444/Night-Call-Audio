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
        <nav className="max-w-[1440px] mx-auto px-4 md:px-12 h-16 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 md:gap-3.5 group transition-all min-w-0">
            <div className="relative w-7 h-7 md:w-10 md:h-10 group-hover:scale-110 transition-transform duration-500 ease-out">
              <Image
                src="/nca_logo.svg"
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-display font-extrabold text-base md:text-xl tracking-tighter text-text-primary group-hover:text-accent transition-colors truncate">
              <span className="hidden sm:inline">Night Call Audio</span>
              <span className="sm:hidden">NCA</span>
            </span>
          </Link>



          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/order-complete"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:border-border-hover hover:bg-bg-elevated transition-all text-sm whitespace-nowrap"
            >
              내 구매
            </Link>
            <Link
              href="/cart"
              className="relative flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:border-border-hover hover:bg-bg-elevated transition-all text-sm whitespace-nowrap"
            >
              <span>Cart</span>
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent text-bg-deep text-xs font-bold flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
