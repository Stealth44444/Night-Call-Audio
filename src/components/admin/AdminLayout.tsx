'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ExternalLink, Menu, X, Clock, List } from 'lucide-react'

const navItems = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard },
  { href: '/admin/products', label: '제품', icon: Package },
  { href: '/admin/orders', label: '승인 대기', icon: Clock },
  { href: '/admin/orders/all', label: '전체 주문', icon: List },
]

function isActive(href: string, pathname: string): boolean {
  if (href === '/admin') return pathname === '/admin'
  if (href === '/admin/orders') return pathname === '/admin/orders'
  return pathname === href || pathname.startsWith(href + '/')
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = () => setMobileOpen(false)

  return (
    <div className="min-h-screen bg-bg-deep flex font-body selection:bg-accent/30">

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/70 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-40 h-screen
          w-64 glass border-r border-border flex flex-col shrink-0
          transition-transform duration-300 ease-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo row */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <Link
              href="/admin"
              onClick={closeMobile}
              className="flex items-center gap-3.5 group"
            >
              <div className="relative w-9 h-9 group-hover:rotate-12 transition-transform duration-500 ease-out">
                <Image src="/nca_logo.svg" alt="Logo" fill className="object-contain" />
              </div>
              <span className="font-display font-extrabold text-xl tracking-tight text-text-primary group-hover:text-accent transition-colors">
                Night Call
              </span>
            </Link>
            <button
              onClick={closeMobile}
              className="lg:hidden p-1.5 text-text-muted hover:text-text-primary rounded-lg transition-colors"
            >
              <X size={17} />
            </button>
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted mt-2">
            Management Suite
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 px-4 space-y-1">
          {navItems.map(item => {
            const active = isActive(item.href, pathname)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 group ${
                  active
                    ? 'bg-accent/10 text-accent font-semibold border border-accent/20'
                    : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                }`}
              >
                <Icon
                  size={17}
                  className={active ? 'text-accent' : 'text-text-muted group-hover:text-text-secondary transition-colors'}
                />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-medium text-text-muted hover:text-accent transition-colors py-2 px-1"
          >
            <ExternalLink size={13} /> View Storefront
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto relative min-w-0">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3.5 border-b border-border bg-bg-deep/90 backdrop-blur-md lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-1 text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="relative w-6 h-6">
              <Image src="/nca_logo.svg" alt="Logo" fill className="object-contain" />
            </div>
            <span className="font-display font-bold text-sm tracking-tight text-text-primary">
              Night Call Admin
            </span>
          </Link>
        </div>

        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-accent/5 blur-[120px] pointer-events-none" />
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-10 relative z-10">
          {children}
        </div>
      </main>
    </div>
  )
}
