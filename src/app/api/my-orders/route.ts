import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')?.toLowerCase().trim()

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const { data: orders, error: ordersError } = await supabaseAdmin
    .from('orders')
    .select('id')
    .eq('email', email)
    .eq('status', 'completed')

  if (ordersError) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }

  if (!orders || orders.length === 0) {
    return NextResponse.json({ downloads: [] })
  }

  const orderIds = orders.map((o: { id: string }) => o.id)

  const { data: tokens, error: tokensError } = await supabaseAdmin
    .from('download_tokens')
    .select('token, expires_at, used_at, products(name)')
    .in('order_id', orderIds)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (tokensError) {
    return NextResponse.json({ error: 'Failed to fetch downloads' }, { status: 500 })
  }

  const downloads = (tokens || []).map((t: {
    token: string
    expires_at: string
    used_at: string | null
    products: { name: string }[] | null
  }) => ({
    token: t.token,
    productName: t.products?.[0]?.name ?? 'Unknown Product',
    expiresAt: t.expires_at,
    used: !!t.used_at,
  }))

  return NextResponse.json({ downloads })
}
