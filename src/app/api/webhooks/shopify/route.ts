import { NextRequest, NextResponse } from 'next/server'
import { createHmac, randomBytes, timingSafeEqual } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendDownloadEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

function verifyShopifyHmac(rawBody: string, hmacHeader: string): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET
  if (!secret || !hmacHeader) return false

  const hash = createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64')

  try {
    return timingSafeEqual(
      Buffer.from(hash, 'utf8'),
      Buffer.from(hmacHeader, 'utf8')
    )
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  // 1. Raw body for HMAC verification
  const rawBody = await request.text()
  const hmacHeader = request.headers.get('x-shopify-hmac-sha256') || ''

  if (!verifyShopifyHmac(rawBody, hmacHeader)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // 2. Parse order data
  const order = JSON.parse(rawBody)
  const topic = request.headers.get('x-shopify-topic')

  if (topic !== 'orders/paid') {
    return NextResponse.json({ error: 'Unhandled topic' }, { status: 400 })
  }

  console.log(`[Webhook] Order #${order.order_number} paid`)

  try {
    // 3. Find pending orders matching this Shopify order
    const { data: pendingOrders, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id, product_id, email, user_id')
      .eq('status', 'pending')
      .eq('shopify_order_id', String(order.id))

    if (fetchError) throw fetchError

    if (!pendingOrders || pendingOrders.length === 0) {
      console.log('[Webhook] No pending orders found for Shopify order', order.id)
      return NextResponse.json({ success: true })
    }

    // 4. Update orders to completed
    await supabaseAdmin
      .from('orders')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('status', 'pending')
      .eq('shopify_order_id', String(order.id))

    // 5. Generate download tokens and send emails
    for (const pendingOrder of pendingOrders) {
      const token = randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

      await supabaseAdmin
        .from('download_tokens')
        .insert({
          order_id: pendingOrder.id,
          product_id: pendingOrder.product_id,
          token,
          expires_at: expiresAt.toISOString(),
        })

      const downloadUrl = `${process.env.FRONTEND_URL}/download/${token}`

      await sendDownloadEmail({
        to: pendingOrder.email,
        orderNumber: order.order_number,
        downloadUrl,
        expiresAt,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Webhook] Processing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
