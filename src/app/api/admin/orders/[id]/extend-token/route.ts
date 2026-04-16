import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: token, error: fetchError } = await supabaseAdmin
    .from('download_tokens')
    .select('id, expires_at')
    .eq('order_id', id)
    .single()

  if (fetchError || !token) {
    return NextResponse.json({ error: '토큰을 찾을 수 없습니다' }, { status: 404 })
  }

  // 현재 만료일이 미래면 거기서 +7일, 이미 만료됐으면 지금부터 +7일
  const base = new Date(token.expires_at) > new Date()
    ? new Date(token.expires_at)
    : new Date()

  const newExpiresAt = new Date(base.getTime() + 7 * 24 * 60 * 60 * 1000)

  const { error: updateError } = await supabaseAdmin
    .from('download_tokens')
    .update({ expires_at: newExpiresAt.toISOString() })
    .eq('id', token.id)

  if (updateError) {
    return NextResponse.json({ error: '만료일 연장 실패' }, { status: 500 })
  }

  return NextResponse.json({ expiresAt: newExpiresAt.toISOString() })
}
