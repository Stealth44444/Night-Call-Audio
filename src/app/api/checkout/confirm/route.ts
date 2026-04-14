import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendDownloadEmail } from '@/lib/email'
import { TOSS_SECRET_KEY } from '@/lib/payment'

export async function POST(request: NextRequest) {
  const { paymentKey, orderId, amount, email } = await request.json()

  if (!email) {
    return NextResponse.json({ error: '이메일이 필요합니다' }, { status: 400 })
  }

  // TODO: 토스페이먼츠 결제 승인 API 호출 (연동 시 활성화)
  // -------------------------------------------------------
  // const encoded = Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64')
  // const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
  //   method: 'POST',
  //   headers: {
  //     Authorization: `Basic ${encoded}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ paymentKey, orderId, amount }),
  // })
  // if (!tossRes.ok) {
  //   const err = await tossRes.json()
  //   return NextResponse.json({ error: err.message }, { status: 400 })
  // }
  // -------------------------------------------------------

  void TOSS_SECRET_KEY // 연동 전 lint 방지용

  // 최근 30분 이내 pending 주문 조회
  const since = new Date(Date.now() - 30 * 60 * 1000).toISOString()
  const { data: orders, error } = await supabaseAdmin
    .from('orders')
    .select('id, product_id, email')
    .eq('email', email.toLowerCase().trim())
    .eq('status', 'pending')
    .gte('created_at', since)

  if (error || !orders?.length) {
    return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 })
  }

  // 주문 완료 처리
  const orderIds = orders.map((o: { id: string }) => o.id)
  await supabaseAdmin
    .from('orders')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .in('id', orderIds)

  // 다운로드 토큰 생성 및 이메일 발송
  for (const order of orders as { id: string; product_id: string; email: string }[]) {
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await supabaseAdmin.from('download_tokens').insert({
      order_id: order.id,
      product_id: order.product_id,
      token,
      expires_at: expiresAt.toISOString(),
    })

    await sendDownloadEmail({
      to: order.email,
      orderNumber: orderId ?? 'NCA',
      downloadUrl: `${process.env.FRONTEND_URL}/download/${token}`,
      expiresAt,
    })
  }

  return NextResponse.json({ success: true })
}
