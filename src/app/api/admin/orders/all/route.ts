import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { data: orders, error } = await supabaseAdmin
    .from('orders')
    .select('id, email, product_id, total_price, payment_method, status, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }

  if (!orders || orders.length === 0) {
    return NextResponse.json({ orders: [] })
  }

  const productIds = [...new Set(orders.map((o: { product_id: string }) => o.product_id))]
  const orderIds = orders.map((o: { id: string }) => o.id)

  const [{ data: products }, { data: tokens }] = await Promise.all([
    supabaseAdmin.from('products').select('id, name').in('id', productIds),
    supabaseAdmin.from('download_tokens').select('order_id, expires_at').in('order_id', orderIds),
  ])

  const productMap = new Map(
    (products ?? []).map((p: { id: string; name: string }) => [p.id, p.name])
  )
  const tokenMap = new Map(
    (tokens ?? []).map((t: { order_id: string; expires_at: string }) => [t.order_id, t.expires_at])
  )

  const enriched = orders.map((o: {
    id: string
    email: string
    product_id: string
    total_price: number
    payment_method: string | null
    status: string
    created_at: string
  }) => ({
    id: o.id,
    email: o.email,
    productName: productMap.get(o.product_id) ?? 'Unknown',
    totalPrice: o.total_price,
    paymentMethod: o.payment_method,
    status: o.status,
    createdAt: o.created_at,
    tokenExpiresAt: tokenMap.get(o.id) ?? null,
  }))

  return NextResponse.json({ orders: enriched })
}
