import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET: 토큰 유효성 검증 (페이지 로드용)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const { data: downloadToken, error } = await supabaseAdmin
    .from('download_tokens')
    .select('id, product_id, expires_at, created_at')
    .eq('token', token)
    .single()

  if (error || !downloadToken) {
    return NextResponse.json({ error: 'invalid' }, { status: 404 })
  }

  if (new Date(downloadToken.expires_at) < new Date()) {
    return NextResponse.json({ error: 'expired' }, { status: 410 })
  }

  const { data: product } = await supabaseAdmin
    .from('products')
    .select('name, image_url')
    .eq('id', downloadToken.product_id)
    .single()

  // image_url이 상대 경로인 경우 공개 URL로 변환
  let imageUrl = product?.image_url ?? null
  if (imageUrl && !imageUrl.startsWith('http')) {
    const { data } = supabaseAdmin.storage.from('products').getPublicUrl(imageUrl)
    imageUrl = data.publicUrl
  }

  return NextResponse.json({
    productName: product?.name ?? 'Unknown Product',
    productImage: imageUrl,
    expiresAt: downloadToken.expires_at,
    purchasedAt: downloadToken.created_at,
  })
}

// POST: 다운로드 실행 (버튼 클릭 시 - 만료 전 횟수 제한 없이 허용)
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

  const { data: product } = await supabaseAdmin
    .from('products')
    .select('name, file_path')
    .eq('id', downloadToken.product_id)
    .single()

  if (!product?.file_path) {
    return NextResponse.json({ error: 'file_error' }, { status: 500 })
  }

  const { data: signedUrl } = await supabaseAdmin
    .storage
    .from('products')
    .createSignedUrl(product.file_path, 3600)

  if (!signedUrl) {
    return NextResponse.json({ error: 'file_error' }, { status: 500 })
  }

  // 첫 다운로드 시각만 기록 (재다운로드 차단 안 함)
  if (!downloadToken.used_at) {
    await supabaseAdmin
      .from('download_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', downloadToken.id)
  }

  return NextResponse.json({
    productName: product.name,
    downloadUrl: signedUrl.signedUrl,
  })
}
