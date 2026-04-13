import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const bucket = (formData.get('bucket') as string) || 'products'

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const originalName = file.name
  const ext = originalName.split('.').pop()
  const baseName = originalName.split('.').slice(0, -1).join('.')
  
  // Sanitize: Keep only alphanumeric and hyphens, replace everything else (including Korean) with '-'
  const sanitizedBase = baseName
    .normalize('NFD') // Normalize Unicode
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-zA-Z0-9]/g, '-') // Replace non-alphanumeric with '-'
    .replace(/-+/g, '-') // Remove double hyphens
    .replace(/^-|-$/g, '') // Remove padding hyphens

  const fileName = `${Date.now()}-${sanitizedBase || 'upload'}.${ext}`

  const { data, error } = await supabaseAdmin
    .storage
    .from(bucket)
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    path: data.path,
    fullPath: `${bucket}/${data.path}`,
  })
}
