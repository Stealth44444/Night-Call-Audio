import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET: 토큰 유효성 검증만 (마킹 안 함 - 페이지 로드용)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const { data: downloadToken, error } = await supabaseAdmin
    .from('download_tokens')
    .select('id, product_id, expires_at, used_at')
    .eq('token', token)
    .single()

  if (error || !downloadToken) {
    return NextResponse.json({ error: 'invalid' }, { status: 404 })
  }

  if (new Date(downloadToken.expires_at) < new Date()) {
    return NextResponse.json({ error: 'expired' }, { status: 410 })
  }

  if (downloadToken.used_at) {
    return NextResponse.json({ error: 'used' }, { status: 403 })
  }

  const { data: product } = await supabaseAdmin
    .from('products')
    .select('name')
    .eq('id', downloadToken.product_id)
    .single()

  return NextResponse.json({ productName: product?.name ?? 'Unknown Product' })
}

// POST: 실제 다운로드 처리 (버튼 클릭 시 호출 - 토큰 소진 + signed URL 반환)
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const { data: downloadToken, error } = await supabaseAdmin
    .from('download_tokens')
    .select('id, product_id, expires_at, used_at')
    .eq('token', token)
    .single()

  if (error || !downloadToken) {
    return NextResponse.json({ error: 'invalid' }, { status: 404 })
  }

  if (new Date(downloadToken.expires_at) < new Date()) {
    return NextResponse.json({ error: 'expired' }, { status: 410 })
  }

  if (downloadToken.used_at) {
    return NextResponse.json({ error: 'used' }, { status: 403 })
  }

  const { data: product } = await supabaseAdmin
    .from('products')
    .select('name, file_path')
    .eq('id', downloadToken.product_id)
    .single()

  if (!product?.file_path) {
    return NextResponse.json({ error: 'file_error' }, { status: 500 })
  }

  // signed URL 먼저 생성
  const { data: signedUrl } = await supabaseAdmin
    .storage
    .from('products')
    .createSignedUrl(product.file_path, 3600)

  if (!signedUrl) {
    return NextResponse.json({ error: 'file_error' }, { status: 500 })
  }

  // 성공 후 토큰 소진
  await supabaseAdmin
    .from('download_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', downloadToken.id)

  return NextResponse.json({
    productName: product.name,
    downloadUrl: signedUrl.signedUrl,
  })
}
