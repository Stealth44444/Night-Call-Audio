import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // 1. Verify order exists
  const { data: order, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('id')
    .eq('id', id)
    .single()

  if (fetchError || !order) {
    return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 })
  }

  // 2. Delete download tokens first (FK constraint)
  const { error: tokenError } = await supabaseAdmin
    .from('download_tokens')
    .delete()
    .eq('order_id', id)

  if (tokenError) {
    console.error('[delete] Token deletion failed:', tokenError)
    return NextResponse.json({ error: '토큰 삭제 실패' }, { status: 500 })
  }

  // 3. Delete the order
  const { error: orderError } = await supabaseAdmin
    .from('orders')
    .delete()
    .eq('id', id)

  if (orderError) {
    console.error('[delete] Order deletion failed:', orderError)
    return NextResponse.json({ error: '주문 삭제 실패' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
