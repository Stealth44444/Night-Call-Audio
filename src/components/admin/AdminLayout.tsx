'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingCart, Package, ExternalLink, LogOut } from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-bg-deep flex font-body selection:bg-accent/30">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-border flex flex-col shrink-0 sticky top-0 h-screen z-20">
        <div className="p-6 border-b border-border">
          <Link href="/admin" className="flex items-center gap-3.5 group transition-all">
            <div className="relative w-9 h-9 group-hover:rotate-12 transition-transform duration-500 ease-out">
              <Image 
                src="/nca_logo.svg" 
                alt="Logo" 
                fill 
                className="object-contain" 
              />
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight text-text-primary group-hover:text-accent transition-colors">
              Night Call
            </span>
          </Link>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted mt-2">Management Suite</p>
        </div>

        <nav className="flex-1 py-8 px-4 space-y-1.5 focus-within:z-10">
          {navItems.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 group ${
                  active
                    ? 'bg-accent/10 text-accent font-semibold border border-accent/20'
                    : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                }`}
              >
                <Icon size={18} className={active ? 'text-accent' : 'text-text-muted group-hover:text-text-secondary'} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-6 border-t border-border space-y-4">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-xs font-medium text-text-muted hover:text-accent transition-colors py-2 px-1"
          >
            <ExternalLink size={14} /> View Storefront
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-accent/5 blur-[120px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto p-10 relative z-10 transition-all duration-500">
          {children}
        </div>
      </main>
    </div>
  )
}
