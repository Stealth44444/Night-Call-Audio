import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/reviews?productId=<uuid>
export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get('productId')
  if (!productId) {
    return NextResponse.json({ error: 'productId required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select('rating, comment, created_at')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  const count = data.length
  const average = count > 0
    ? Math.round((data.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10
    : null

  return NextResponse.json({ average, count, reviews: data })
}

// POST /api/reviews
export async function POST(req: NextRequest) {
  let body: { token?: string; rating?: number; comment?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const { token, rating, comment } = body

  if (!token || typeof rating !== 'number' || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'invalid_params' }, { status: 400 })
  }

  const { data: downloadToken, error: tokenError } = await supabaseAdmin
    .from('download_tokens')
    .select('id, product_id, expires_at')
    .eq('token', token)
    .single()

  if (tokenError || !downloadToken) {
    return NextResponse.json({ error: 'invalid_token' }, { status: 404 })
  }

  const trimmedComment = typeof comment === 'string' ? comment.trim().slice(0, 200) : null

  const { error: insertError } = await supabaseAdmin
    .from('reviews')
    .insert({
      product_id: downloadToken.product_id,
      token,
      rating,
      comment: trimmedComment || null,
    })

  if (insertError) {
    if (insertError.code === '23505') {
      return NextResponse.json({ error: 'already_reviewed' }, { status: 409 })
    }
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
