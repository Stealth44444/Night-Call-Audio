import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')?.toLowerCase().trim()

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const { data: allOrders, error: allOrdersError } = await supabaseAdmin
    .from('orders')
    .select('id, status')
    .eq('email', email)

  if (allOrdersError) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }

  if (!allOrders || allOrders.length === 0) {
    return NextResponse.json({ downloads: [], hasOrders: false })
  }

  const completedOrders = allOrders.filter(o => o.status === 'completed')
  const hasPendingOrders = allOrders.some(o => o.status === 'pending')

  if (completedOrders.length === 0) {
    return NextResponse.json({ 
      downloads: [], 
      hasOrders: true, 
      hasPendingOrders 
    })
  }

  const orderIds = completedOrders.map((o: { id: string }) => o.id)

  const { data: tokens, error: tokensError } = await supabaseAdmin
    .from('download_tokens')
    .select('token, expires_at, used_at, product_id, created_at')
    .in('order_id', orderIds)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (tokensError) {
    return NextResponse.json({ error: 'Failed to fetch downloads' }, { status: 500 })
  }

  const productIds = [
    ...new Set(
      (tokens || [])
        .map((t: { product_id: string }) => t.product_id)
        .filter(Boolean)
    ),
  ]

  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id, name, image_url')
    .in('id', productIds)

  const productMap = new Map(
    (products || []).map((p: { id: string; name: string; image_url: string | null }) => {
      // image_url이 상대 경로인 경우 Supabase 공개 URL로 변환
      let imageUrl = p.image_url ?? null
      if (imageUrl && !imageUrl.startsWith('http')) {
        const { data } = supabaseAdmin.storage.from('products').getPublicUrl(imageUrl)
        imageUrl = data.publicUrl
      }
      return [p.id, { ...p, image_url: imageUrl }]
    })
  )

  const downloads = (tokens || []).map(
    (t: {
      token: string
      expires_at: string
      used_at: string | null
      product_id: string
      created_at: string
    }) => {
      const product = productMap.get(t.product_id)
      return {
        token: t.token,
        productName: product?.name ?? 'Unknown Product',
        productImage: product?.image_url ?? null,
        expiresAt: t.expires_at,
        purchasedAt: t.created_at,
        used: !!t.used_at,
      }
    }
  )

  return NextResponse.json({ downloads })
}
