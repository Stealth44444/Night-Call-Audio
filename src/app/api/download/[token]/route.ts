import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const { data: downloadToken, error } = await supabaseAdmin
    .from('download_tokens')
    .select('id, order_id, product_id, expires_at, used_at')
    .eq('token', token)
    .single()

  if (error || !downloadToken) {
    return NextResponse.json({ error: 'invalid', message: 'Token not found' }, { status: 404 })
  }

  if (new Date(downloadToken.expires_at) < new Date()) {
    return NextResponse.json({ error: 'expired', message: 'Token expired' }, { status: 410 })
  }

  if (downloadToken.used_at) {
    return NextResponse.json({ error: 'used', message: 'Token already used' }, { status: 403 })
  }

  const { data: product } = await supabaseAdmin
    .from('products')
    .select('name, file_path')
    .eq('id', downloadToken.product_id)
    .single()

  if (!product) {
    return NextResponse.json({ error: 'not_found', message: 'Product not found' }, { status: 404 })
  }

  // Generate signed URL first
  const { data: signedUrl } = await supabaseAdmin
    .storage
    .from('products')
    .createSignedUrl(product.file_path, 3600)

  if (!signedUrl) {
    return NextResponse.json({ error: 'file_error', message: 'File not available' }, { status: 500 })
  }

  // Mark as used only after signed URL is successfully generated
  await supabaseAdmin
    .from('download_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', downloadToken.id)

  return NextResponse.json({
    productName: product.name,
    downloadUrl: signedUrl.signedUrl,
  })
}
