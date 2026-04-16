import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendDownloadEmail } from '@/lib/email'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // 1. Fetch the order with product name
  const { data: order, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('id, product_id, email, total_price, status, products(name)')
    .eq('id', id)
    .single()

  if (fetchError) {
    console.error('[approve] Fetch error:', fetchError)
    return NextResponse.json({ error: '주문 조회 실패' }, { status: 500 })
  }

  if (!order) {
    return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 })
  }

  if (order.status !== 'pending') {
    return NextResponse.json({ error: '이미 처리된 주문입니다' }, { status: 409 })
  }

  // 2. Create download token first — if this fails, order stays pending (recoverable)
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const { error: tokenError } = await supabaseAdmin.from('download_tokens').insert({
    order_id: order.id,
    product_id: order.product_id,
    token,
    expires_at: expiresAt.toISOString(),
  })

  if (tokenError) {
    return NextResponse.json({ error: '토큰 생성 실패' }, { status: 500 })
  }

  // 3. Mark as completed (token already exists, safe to proceed)
  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: '주문 업데이트 실패' }, { status: 500 })
  }

  // 4. Send email to customer
  const productRaw = order.products
  const productName = Array.isArray(productRaw)
    ? (productRaw[0]?.name as string | undefined)
    : (productRaw as { name: string } | null)?.name
  try {
    await sendDownloadEmail({
      to: order.email,
      orderNumber: order.id,
      productName,
      downloadUrl: `${process.env.FRONTEND_URL}/download/${token}`,
      expiresAt,
    })
  } catch (err) {
    console.error('[approve] Failed to send customer email:', err)
    // Don't fail — order is already approved and token exists
  }

  return NextResponse.json({ success: true })
}
