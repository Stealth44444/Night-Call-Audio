import { supabaseAdmin } from '@/lib/supabase-admin'
import Link from 'next/link'
import { Package, ShoppingCart, Activity, Plus, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const { count: productCount } = await supabaseAdmin
    .from('products')
    .select('*', { count: 'exact', head: true })

  const { count: orderCount } = await supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact', head: true })

  const { count: pendingCount } = await supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const stats = [
    { label: 'Total Products', value: productCount ?? 0, href: '/admin/products', icon: Package, color: 'text-accent' },
    { label: 'Total Orders', value: orderCount ?? 0, href: '#', icon: ShoppingCart, color: 'text-nca-blue-bright' },
    { label: 'Pending Orders', value: pendingCount ?? 0, href: '#', icon: Activity, color: 'text-nca-pink' },
  ]

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-text-primary">Admin Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">Night Call Audio 운영 대시보드</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map(stat => (
          <Link key={stat.label} href={stat.href} className="group">
            <div className="glass glass-hover rounded-2xl p-7 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-bg-deep border border-border group-hover:border-accent/30 transition-colors`}>
                  <stat.icon size={20} className={stat.color} />
                </div>
                <ArrowRight size={16} className="text-text-muted opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </div>
              <p className="text-sm font-medium text-text-secondary">{stat.label}</p>
              <p className="text-4xl font-display font-extrabold text-text-primary mt-2">{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="glass rounded-3xl overflow-hidden p-8 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[80px] -mr-32 -mt-32" />
        
        <div className="relative z-10">
          <h2 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
            <Plus size={20} className="text-accent" /> Quick Actions
          </h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-bg-deep font-bold rounded-xl hover:bg-accent-bright transition-all btn-glow text-sm"
            >
              <Plus size={18} /> 새 제품 등록하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
