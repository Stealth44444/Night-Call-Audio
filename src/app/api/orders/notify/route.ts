import { NextRequest, NextResponse } from 'next/server'
import { sendAdminNotificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) {
    // Silently succeed — no admin email configured yet
    return NextResponse.json({ ok: true })
  }

  const { customerEmail, products, totalPrice, paymentMethod, orderedAt } =
    await request.json()

  if (!customerEmail || !paymentMethod) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    await sendAdminNotificationEmail({
      adminEmail,
      customerEmail,
      products: products ?? [],
      totalPrice: totalPrice ?? 0,
      paymentMethod,
      orderedAt: orderedAt ?? new Date().toISOString(),
    })
  } catch (err) {
    // Log but don't fail the request — notification failure shouldn't block checkout
    console.error('[notify] Failed to send admin email:', err)
  }

  return NextResponse.json({ ok: true })
}
