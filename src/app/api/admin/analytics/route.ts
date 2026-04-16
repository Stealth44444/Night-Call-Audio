import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Completed orders with product info
  const { data: completedRaw } = await supabaseAdmin
    .from('orders')
    .select('id, total_price, created_at, updated_at, product_id, products(name, category)')
    .eq('status', 'completed')
    .order('created_at', { ascending: true })

  // Pending orders
  const { data: pendingRaw } = await supabaseAdmin
    .from('orders')
    .select('id, created_at')
    .eq('status', 'pending')

  type CompletedOrder = {
    id: string
    total_price: number
    created_at: string
    updated_at: string | null
    product_id: string
    products: { name: string; category: string } | null
  }

  const completed: CompletedOrder[] = (completedRaw ?? []) as unknown as CompletedOrder[]
  const pending = pendingRaw ?? []

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  // Key metrics
  const totalRevenue = completed.reduce((s, o) => s + (o.total_price ?? 0), 0)
  const monthRevenue = completed
    .filter(o => new Date(o.created_at) >= monthStart)
    .reduce((s, o) => s + (o.total_price ?? 0), 0)
  const aov = completed.length > 0 ? totalRevenue / completed.length : 0

  // 30-day daily trend
  const dailyMap = new Map<string, number>()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  completed
    .filter(o => new Date(o.created_at) >= thirtyDaysAgo)
    .forEach(o => {
      const day = o.created_at.slice(0, 10)
      dailyMap.set(day, (dailyMap.get(day) ?? 0) + (o.total_price ?? 0))
    })

  const trend30: { date: string; revenue: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().slice(0, 10)
    trend30.push({ date: key, revenue: dailyMap.get(key) ?? 0 })
  }

  // Top 5 products by order count
  const productSales = new Map<string, { name: string; count: number; revenue: number }>()
  completed.forEach(o => {
    const name = o.products?.name ?? 'Unknown'
    const curr = productSales.get(o.product_id) ?? { name, count: 0, revenue: 0 }
    productSales.set(o.product_id, {
      name,
      count: curr.count + 1,
      revenue: curr.revenue + (o.total_price ?? 0),
    })
  })
  const topProducts = [...productSales.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Category breakdown
  const catSales = new Map<string, { count: number; revenue: number }>()
  completed.forEach(o => {
    const cat = o.products?.category ?? 'other'
    const curr = catSales.get(cat) ?? { count: 0, revenue: 0 }
    catSales.set(cat, { count: curr.count + 1, revenue: curr.revenue + (o.total_price ?? 0) })
  })
  const categoryBreakdown = [...catSales.entries()].map(([name, data]) => ({ name, ...data }))

  // Avg approval wait time (hours) for completed orders
  const waitTimes = completed
    .filter(o => o.updated_at)
    .map(o => (new Date(o.updated_at!).getTime() - new Date(o.created_at).getTime()) / 3_600_000)
  const avgWaitHours =
    waitTimes.length > 0 ? waitTimes.reduce((s, t) => s + t, 0) / waitTimes.length : 0

  return NextResponse.json({
    totalRevenue,
    monthRevenue,
    aov: Math.round(aov),
    totalOrders: completed.length,
    pendingCount: pending.length,
    trend30,
    topProducts,
    categoryBreakdown,
    avgWaitHours,
  })
}
